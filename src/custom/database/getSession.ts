import { DatabaseInfo } from '../types/DatabaseInfo';

const neo4j = require('neo4j-driver');

export function getSession(databaseInfo: DatabaseInfo) {
    const driver = neo4j.driver(
        databaseInfo.URI,
        neo4j.auth.basic(
            databaseInfo.USER,
            databaseInfo.PASSWORD
        )
    );
    if (!databaseInfo.DATABASE) return driver.session();
    return driver.session({database: databaseInfo.DATABASE});
}

// module.exports = getSession;