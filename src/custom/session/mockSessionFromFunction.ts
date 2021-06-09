import Session from 'neo4j-driver/types/session';

const neo4j = require('neo4j-driver');

const mockDatabaseInfo = {
    URI: 'neo4j+s://84751e18.databases.neo4j.io',
    USER: 'faker',
    PASSWORD: 'thisIsAfakeDatabase',
};

export function mockSessionFromFunction(sessionRunMock: Function): Session {
    const driver = neo4j.driver(
        mockDatabaseInfo.URI,
        neo4j.auth.basic(
            mockDatabaseInfo.USER,
            mockDatabaseInfo.PASSWORD
        )
    )
    const fakeSession = driver.session()
    fakeSession.run = sessionRunMock
    return fakeSession
}

module.exports = mockSessionFromFunction;
