import test from 'ava'

const neo4j = require('neo4j-driver');
import {getSession} from '../../src/custom/database/getSession'
import {DatabaseInfo} from "../../src";

const databaseInfo: DatabaseInfo = {
    URI: 'neo4j+s://demo.neo4jlabs.com',
    USER: 'movies',
    PASSWORD: 'movies',
    DATABASE: 'movies',
};

const databaseInfoNoDatabase: DatabaseInfo = {
    URI: 'neo4j+s://demo.neo4jlabs.com',
    USER: 'movies',
    PASSWORD: 'movies',
};


const driver = neo4j.driver(
    databaseInfo.URI,
    neo4j.auth.basic(
        databaseInfo.USER,
        databaseInfo.PASSWORD
    )
);


test('getSession with database', async t => {
    const session = await getSession(databaseInfo)
    // const expectedSession = driver.session({database: databaseInfo.DATABASE})
    t.is(session._database, 'movies')
})

test('getSession without database', async t => {
    const session = await getSession(databaseInfoNoDatabase)
    // const expectedSession = driver.session({database: databaseInfo.DATABASE})
    t.is(session._database, '')
})
