import { DatabaseInfo } from '../../index';
import { getDatabaseInfo } from './getDatabaseInfo';
import { Config } from 'neo4j-driver';

const neo4j = require('neo4j-driver');

export function driverFromDatabaseInfo(databaseInfo?: DatabaseInfo) {
  const { URI, USER, PASSWORD } = databaseInfo || getDatabaseInfo();

  const config: Config = {
    disableLosslessIntegers: true,
    maxConnectionLifetime: 1 * 60 * 60 * 1000, // 1 hour
    maxConnectionPoolSize: 50,
    connectionTimeout: 30000, // 30 seconds
  };

  return neo4j.driver(
    URI,
    neo4j.auth.basic(USER, PASSWORD),
    config
  );
}
