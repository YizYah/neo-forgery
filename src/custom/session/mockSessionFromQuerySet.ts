import {QuerySpec} from "../types/QuerySpec";
import Session from 'neo4j-driver/types/session';
import {mockResultsFromCapturedOutput} from '../results/mockResultsFromCapturedOutput';

const neo4j = require('neo4j-driver');

const mockDatabaseInfo = {
    URI: 'neo4j+s://84751e18.databases.neo4j.io',
    USER: 'faker',
    PASSWORD: 'thisIsAfakeDatabase',
};

function mockSessionFromQuerySet(querySet: QuerySpec[]): Session {
    const driver = neo4j.driver(
        mockDatabaseInfo.URI,
        neo4j.auth.basic(
            mockDatabaseInfo.USER,
            mockDatabaseInfo.PASSWORD
        )
    )


    const fakeSession = driver.session()
    fakeSession.run = async (query: string, params: any) => {
        let output: any = ''
        querySet.map((querySpec: QuerySpec) => {
            if (querySpec.query === query &&
                JSON.stringify(querySpec.params) === JSON.stringify(params)) {
                output = mockResultsFromCapturedOutput(querySpec.output)
            }
        })
        if (output !== '') return output
        throw new Error(`the query set provided does not contain the given query and params:
        query provided = ${query}.`)
    }
    return fakeSession
}

module.exports = mockSessionFromQuerySet;
