import test from 'ava'
import { mockDriver } from '../../src/custom/driver/mockDriver';
import { mockSessionFromFunction } from '../../src/custom/session/mockSessionFromFunction';

test('mockDriver', t => {
  const session = mockSessionFromFunction(() => {});
  const result = mockDriver(mockDriver(session));
  t.is(result._meta.address._host, 'fake.databases.neo4j.io');
  // t.is(result.verifyConnectivity, (() => Promise.resolve({})).toString)
  // t.is(result.supportsMultiDb, (() => Promise.resolve(true)).toString)
  // t.is(result.supportsTransactionConfig, (() => Promise.resolve(true)).toString)
})
