import { DatabaseInfo } from '../types/DatabaseInfo';
import { driverFromDatabaseInfo } from './driverFromDatabaseInfo';
import { SessionConfig } from 'neo4j-driver';

export function getSession(databaseInfo: DatabaseInfo) {
    const driver = driverFromDatabaseInfo(databaseInfo);
    const config: SessionConfig = {};
    if (databaseInfo.DATABASE) {
        config.database = databaseInfo.DATABASE;
    }
    return driver.session(config);
}

// module.exports = getSession;
