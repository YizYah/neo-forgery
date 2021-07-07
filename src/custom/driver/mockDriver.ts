import Session from 'neo4j-driver-core/types/session';
import { DatabaseInfo } from '../..';
import { driverFromDatabaseInfo } from '../database/driverFromDatabaseInfo';

export function mockDriver(session: Session, databaseInfo?: DatabaseInfo) {
  const driver = driverFromDatabaseInfo(databaseInfo);

  // overrides
  driver.session = () => session;
  // driver.verifyConnectivity = () => Promise.resolve({});
  // driver.supportsMultiDb = () => Promise.resolve(true);
  // driver.supportsTransactionConfig = () => Promise.resolve(true);

  return driver;
}
