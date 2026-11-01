import test from 'ava'
import {QuerySpec} from '../../src/custom/types/QuerySpec'
import {DatabaseInfo} from "../../src/custom/types/DatabaseInfo";
import {
    expectedResultForMovieQuery,
    expectedResultsForTitleQuery
} from "./data/expectedResults";
import { testQuerySet } from '../../src/custom/session/testQuerySet'
import { mockSessionFromQuerySet } from '../../src/custom/session/mockSessionFromQuerySet'
import { getSession } from '../../src/custom/database/getSession'
import * as proxyquire from 'proxyquire'
import { Session } from 'neo4j-driver'

const defaultGetSession = (databaseInfo: DatabaseInfo): Session => {
    return mockSessionFromQuerySet([]);
};

const getSessionStub = {
    getSession: defaultGetSession
};

const { testQuerySet: testQuerySetWithStub } = proxyquire('../../src/custom/session/testQuerySet', {
    '../database/getSession': getSessionStub
});

const moviesDatabaseInfo: DatabaseInfo = require('./data/moviesDatabaseInfo')

const querySet: QuerySpec[] = [
    {
        name: 'movies',
        query: 'MATCH (movie:Movie)' +
            ' WHERE toLower(movie.title) CONTAINS $query' +
            ' RETURN movie',
        output: expectedResultForMovieQuery,
        params: {query: "matrix"}
    },
    {
        name: 'title',
        query: 'MATCH (movie:Movie {title:$title}) ' +
            'OPTIONAL MATCH (movie)<-[rel]-(person:Person) ' +
            'RETURN movie.title as title, ' +
            'collect({name:person.name, role:rel.roles, job:head(split(toLower(type(rel)),\'_\'))}) as cast ' +
            'LIMIT 1',
        params: {title: 'Apollo 13'},
        output: expectedResultsForTitleQuery,
    }
]

const querySetNoNameForMovies: QuerySpec[] = [
    {
        query: 'MATCH (movie:Movie)' +
            ' WHERE toLower(movie.title) CONTAINS $query' +
            ' RETURN movie',
        output: expectedResultForMovieQuery,
        params: {query: "matrix"}
    },
    {
        name: 'title',
        query: 'MATCH (movie:Movie {title:$title}) ' +
            'OPTIONAL MATCH (movie)<-[rel]-(person:Person) ' +
            'RETURN movie.title as title, ' +
            'collect({name:person.name, role:rel.roles, job:head(split(toLower(type(rel)),\'_\'))}) as cast ' +
            'LIMIT 1',
        params: {title: 'Apollo 13'},
        output: expectedResultsForTitleQuery,
    }
]

const failingQuerySet: QuerySpec[] = [
    {
        name: 'title',
        query: 'MATCH (movie:Movie {title:$title}) ' +
            'OPTIONAL MATCH (movie)<-[rel]-(person:Person) ' +
            'RETURN movie.title as title, ' +
            'collect({name:person.name, role:rel.roles, job:head(split(toLower(type(rel)),\'_\'))}) as cast ' +
            'LIMIT 1',
        params: {title: 'Apollo 13'},
        output: expectedResultsForTitleQuery,
    },
    {
        name: 'moviesBad',
        query: 'MATCH (movie:Movie)' +
            ' WHERE toLower(movie.title) CONTAINS $query' +
            ' RETURN movie',
        output: expectedResultsForTitleQuery,
        params: {query: "matrix"}
    },
]

const failingQuerySetNoName: QuerySpec[] = [
    {
        query: 'MATCH (movie:Movie)' +
            ' WHERE toLower(movie.title) CONTAINS $query' +
            ' RETURN movie',
        output: expectedResultsForTitleQuery,
        params: {query: "matrix"}
    },
]

test('testQuerySet Positive Result', async t => {
    const testQuerySet = [{
        name: 'movies',
        query: 'MATCH (movie:Movie) RETURN movie',
        params: { title: 'The Matrix' },
        output: {
            records: [{
                keys: ['movie'],
                _fields: [{ title: 'The Matrix' }],
                _fieldLookup: { movie: 0 }
            }]
        }
    }];

    getSessionStub.getSession = function(databaseInfo: DatabaseInfo): Session {
        return mockSessionFromQuerySet(testQuerySet);
    }

    const result = await testQuerySetWithStub(testQuerySet, {
        URI: 'neo4j+s://test.databases.neo4j.io',
        USER: 'test',
        PASSWORD: 'test'
    });

    t.is(result, 'success');
    getSessionStub.getSession = defaultGetSession;
});

test('testQuerySet Negative Result', async t => {
    const expectedQuerySet = [{
        name: 'moviesBad',
        query: 'MATCH (movie:Movie) RETURN movie',
        params: { title: 'The Matrix' },
        output: {
            records: [{
                keys: ['movie'],
                _fields: [{ title: 'The Matrix' }],
                _fieldLookup: { movie: 0 }
            }]
        }
    }];

    const mockQuerySet = [{
        name: 'moviesBad',
        query: 'MATCH (movie:Movie) RETURN movie',
        params: { title: 'The Matrix' },
        output: {
            records: [{
                keys: ['movie'],
                _fields: [{ title: 'Wrong Movie' }],
                _fieldLookup: { movie: 0 }
            }]
        }
    }];

    getSessionStub.getSession = function(databaseInfo: DatabaseInfo): Session {
        return mockSessionFromQuerySet(mockQuerySet);
    }

    const error = await t.throwsAsync(async () => {
        await testQuerySetWithStub(expectedQuerySet, {
            URI: 'neo4j+s://test.databases.neo4j.io',
            USER: 'test',
            PASSWORD: 'test'
        });
    });

    t.regex(error.message, /query 'moviesBad' is failing! returned this:/);
    getSessionStub.getSession = defaultGetSession;
});

test('testQuerySet Negative Result no Name', async t => {
    getSessionStub.getSession = function(databaseInfo: DatabaseInfo){
        return mockSessionFromQuerySet(querySet)
    }
    const error = await t.throwsAsync(async () => {
        const queriesWorking = await testQuerySetWithStub(failingQuerySetNoName, moviesDatabaseInfo)
    });
    t.regex(error.message, /query 'MATCH \(movie:Movie\)/);
    getSessionStub.getSession = defaultGetSession;
})

test('testQuerySet Failing Execution of Query', async t => {
    const erringDatabaseInfo: DatabaseInfo = {
        URI: 'neo4j+s://demo.neo4jlabs.com',
        USER: 'movies',
        PASSWORD: 'bogus',
    }

    const errorSession = function(databaseInfo: DatabaseInfo): Session {
        const session = mockSessionFromQuerySet(querySet)
        session.run = function(){
            throw new Error('uh-oh')
        }
        return session
    }

    getSessionStub.getSession = errorSession

    const error = await t.throwsAsync(async () => {
        const queriesWorking = await testQuerySetWithStub(querySet, erringDatabaseInfo)
    });
    t.regex(error.message, /error running query 'movies'/);
    getSessionStub.getSession = defaultGetSession;
})

test('testQuerySet Failing Execution of Query no name', async t => {
    const erringDatabaseInfo: DatabaseInfo = {
        URI: 'neo4j+s://demo.neo4jlabs.com',
        USER: 'movies',
        PASSWORD: 'bogus',
    }

    const errorSession = function(databaseInfo: DatabaseInfo): Session {
        const session = mockSessionFromQuerySet(querySetNoNameForMovies)
        session.run = function(){
            throw new Error('uh-oh')
        }
        return session
    }

    getSessionStub.getSession = errorSession

    const error = await t.throwsAsync(async () => {
        const queriesWorking =
            await testQuerySetWithStub(querySetNoNameForMovies, erringDatabaseInfo)
    });
    t.regex(error.message, /error running query 'MATCH \(movie:Movie\)/);
    getSessionStub.getSession = defaultGetSession;
})
