import { DatabaseInfo } from '../../index';
import { getDatabaseInfo } from './getDatabaseInfo';

const neo4j = require('neo4j-driver');

export function driverFromDatabaseInfo(databaseInfo?: DatabaseInfo) {
  const { URI, USER, PASSWORD } = databaseInfo || getDatabaseInfo();

  return neo4j.driver(
    URI,
    neo4j.auth.basic(USER, PASSWORD),
    { disableLosslessIntegers: true },
  );
}
