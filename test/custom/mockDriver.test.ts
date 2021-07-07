import test from 'ava'
import { mockDriver } from '../../src/custom/driver/mockDriver';
import { mockSessionFromFunction } from '../../src';

test('mockDriver', t => {
  const session = mockSessionFromFunction(()=>{})
  const result = mockDriver(mockDriver(session))
  t.is(result.session.toString, (() => session).toString)
  // t.is(result.verifyConnectivity, (() => Promise.resolve({})).toString)
  // t.is(result.supportsMultiDb, (() => Promise.resolve(true)).toString)
  // t.is(result.supportsTransactionConfig, (() => Promise.resolve(true)).toString)
})
