import Session from 'neo4j-driver-core/types/session';

const neo4j = require('neo4j-driver');

const mockDatabaseInfo = {
    URI: 'neo4j+s://84751e18.databases.neo4j.io',
    USER: 'faker',
    PASSWORD: 'thisIsAfakeDatabase',
};

export function mockSessionFromFunction(mockRun: Function): Session {
    const driver = neo4j.driver(
        mockDatabaseInfo.URI,
        neo4j.auth.basic(
            mockDatabaseInfo.USER,
            mockDatabaseInfo.PASSWORD
        )
    )
    const fakeSession = driver.session()
    fakeSession.run = mockRun


    const mockBeginTransaction = (transactionType: string) => {
        let _isOpen = true;
        return {
            run: async (query: string, params: any) => {
                const output = await mockRun(query, params)
                output.summary.transactionType = transactionType
                return output
            },
            commit: () => {
                _isOpen = false;
                return Promise.resolve()
            },
            rollback: () => {
                _isOpen = false;
                return Promise.resolve();
            },
            isOpen: () => _isOpen
        }
    }
    fakeSession._beginTransaction = mockBeginTransaction

    return fakeSession
}

module.exports = mockSessionFromFunction;
