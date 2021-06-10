import test from 'ava'
import {QuerySpec} from '../../src/custom/types/QuerySpec'
import {DatabaseInfo} from "../../src/custom/types/DatabaseInfo";
import {
    expectedResultForMovieQuery,
    expectedResultsForTitleQuery
} from "./data/expectedResults";

const proxyquire = require('proxyquire')
const getSessionStub: any = {}

const testQuerySetModule = proxyquire('../../src/custom/session/testQuerySet', {
    '../../../test/custom/database/getSession': getSessionStub
})


const mockSessionFromQuerySet = require('../../src/custom/session/mockSessionFromQuerySet')
// const {testQuerySet} = require("../../src/custom/session/testQuerySet")
const moviesDatabaseInfo: DatabaseInfo = require('./database/moviesDatabaseInfo')

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
    getSessionStub.getSession = function(databaseInfo: DatabaseInfo){
        return mockSessionFromQuerySet(querySet)
    }
    console.log(`getSessionStub =${JSON.stringify(getSessionStub)}`)
    const queriesWorking = await testQuerySetModule.testQuerySet(querySet, moviesDatabaseInfo)
    t.is(queriesWorking, "success")
    getSessionStub.getSession = undefined
})

test('testQuerySet Negative Result', async t => {
    getSessionStub.getSession = function(databaseInfo: DatabaseInfo){
        console.log('!!!in mock!!! failingQuerySet')
        return mockSessionFromQuerySet(querySet)
    }
    const error = await t.throwsAsync(async () => {
        const queriesWorking = await testQuerySetModule.testQuerySet(failingQuerySet, moviesDatabaseInfo)
    });
    t.regex(error.message, /query 'moviesBad' is failing!/);
    getSessionStub.getSession = undefined
})

test('testQuerySet Negative Result no Name', async t => {
    getSessionStub.getSession = function(databaseInfo: DatabaseInfo){
        console.log('!!!in mock!!! failingQuerySetNoName')
        return mockSessionFromQuerySet(querySet)
    }
    const error = await t.throwsAsync(async () => {
        const queriesWorking = await testQuerySetModule.testQuerySet(failingQuerySetNoName, moviesDatabaseInfo)
    });
    t.regex(error.message, /query 'MATCH \(movie:Movie\)/);
    getSessionStub.getSession = undefined
})

test('testQuerySet Failing Execution of Query', async t => {
    const erringDatabaseInfo: DatabaseInfo = {
        URI: 'neo4j+s://demo.neo4jlabs.com',
        USER: 'movies',
        PASSWORD: 'bogus',
    }

    getSessionStub.getSession = function(databaseInfo: DatabaseInfo){
        console.log('!!!in mock!!! erringDatabaseInfo')
        const session=mockSessionFromQuerySet(querySet)
        session.run = function(){
            throw new Error('uh-oh')
        }
        return session
    }

    const error = await t.throwsAsync(async () => {
        const queriesWorking = await testQuerySetModule.testQuerySet(querySet, erringDatabaseInfo)
    });
    t.regex(error.message, /error running query 'movies'/);
    getSessionStub.getSession = undefined
})

test('testQuerySet Failing Execution of Query no name', async t => {
    const erringDatabaseInfo: DatabaseInfo = {
        URI: 'neo4j+s://demo.neo4jlabs.com',
        USER: 'movies',
        PASSWORD: 'bogus',
    }

    getSessionStub.getSession = function(databaseInfo: DatabaseInfo){
        console.log('!!!in mock!!! erringDatabaseInfoquerySetNoNameForMovies')
        const session = mockSessionFromQuerySet(querySetNoNameForMovies)
        session.run = function(){
            throw new Error('uh-oh')
        }
        return session
    }

    const error = await t.throwsAsync(async () => {
        const queriesWorking =
            await testQuerySetModule.testQuerySet(querySetNoNameForMovies, erringDatabaseInfo)
    });
    t.regex(error.message, /error running query 'MATCH \(movie:Movie\)/);
    getSessionStub.getSession = undefined
})
