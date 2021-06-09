import test from 'ava'
import {QuerySpec} from '../../src/custom/types/QuerySpec'
import {DatabaseInfo} from "../../src/custom/types/DatabaseInfo";
import {
    expectedResultForMovieQuery,
    expectedResultsForTitleQuery
} from "./data/expectedResults";

const {testQuerySet} = require("../../src/custom/session/testQuerySet")
const moviesDatabaseInfo: DatabaseInfo = require('./database/moviesDatabaseInfo')

const querySet:QuerySpec[] = [
    {
        name: 'movies',
        query: 'MATCH (movie:Movie)' +
            ' WHERE toLower(movie.title) CONTAINS $query' +
            ' RETURN movie',
        output: expectedResultForMovieQuery,
        params: {query:"matrix"}
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


const querySetNoNameForMovies:QuerySpec[] = [
    {
        query: 'MATCH (movie:Movie)' +
            ' WHERE toLower(movie.title) CONTAINS $query' +
            ' RETURN movie',
        output: expectedResultForMovieQuery,
        params: {query:"matrix"}
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


const failingQuerySet:QuerySpec[] = [
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
        params: {query:"matrix"}
    },
]


const failingQuerySetNoName:QuerySpec[] = [
    {
        query: 'MATCH (movie:Movie)' +
            ' WHERE toLower(movie.title) CONTAINS $query' +
            ' RETURN movie',
        output: expectedResultsForTitleQuery,
        params: {query:"matrix"}
    },
]


test('testQuerySet Positive Result', async t => {
    const queriesWorking = await testQuerySet(querySet, moviesDatabaseInfo)
    t.is(queriesWorking, "success")
})

test('testQuerySet Negative Result', async t => {
    const error = await t.throwsAsync(async () => {
        const queriesWorking = await testQuerySet(failingQuerySet, moviesDatabaseInfo)
    });
    t.regex(error.message, /query 'moviesBad' is failing!/);
})

test('testQuerySet Negative Result no Name', async t => {
    const error = await t.throwsAsync(async () => {
        const queriesWorking = await testQuerySet(failingQuerySetNoName, moviesDatabaseInfo)
    });
    t.regex(error.message, /query 'MATCH \(movie:Movie\)/);
})

test('testQuerySet Failing Execution of Query', async t => {
    const erringDatabaseInfo: DatabaseInfo = {
        URI: 'neo4j+s://demo.neo4jlabs.com',
        USER: 'movies',
        PASSWORD: 'bogus',
    }

    const error = await t.throwsAsync(async () => {
        const queriesWorking = await testQuerySet(querySet, erringDatabaseInfo)
    });
    t.regex(error.message, /error running query 'movies'/);
})

test('testQuerySet Failing Execution of Query no name', async t => {
    const erringDatabaseInfo: DatabaseInfo = {
        URI: 'neo4j+s://demo.neo4jlabs.com',
        USER: 'movies',
        PASSWORD: 'bogus',
    }

    const error = await t.throwsAsync(async () => {
        const queriesWorking =
            await testQuerySet(querySetNoNameForMovies, erringDatabaseInfo)
    });
    t.regex(error.message, /error running query 'MATCH \(movie:Movie\)/);
})
