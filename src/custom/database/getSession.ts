import { DatabaseInfo } from '../types/DatabaseInfo';
import { driverFromDatabaseInfo } from './driverFromDatabaseInfo';

export function getSession(databaseInfo: DatabaseInfo) {
    const driver = driverFromDatabaseInfo(databaseInfo)
    if (!databaseInfo.DATABASE) return driver.session();
    return driver.session({database: databaseInfo.DATABASE});
}

// module.exports = getSession;
