import test from 'ava'
import { mockDriver } from '../../src/custom/driver/mockDriver';
import { mockSessionFromFunction } from '../../src';
import { dataToLive } from '../../src/custom/response/dataToLive';
import { sampleRecordList } from './data/sampleRecordList';

test('mockDriver hands out the provided session', t => {
  const session = mockSessionFromFunction(() => dataToLive(sampleRecordList))
  const driver = mockDriver(session)
  t.is(driver.session(), session)
})

test('mockDriver public surface resolves', async t => {
  const session = mockSessionFromFunction(() => dataToLive(sampleRecordList))
  const driver: any = mockDriver(session)

  t.is(await driver.verifyConnectivity(), undefined)
  t.is(await driver.supportsMultiDb(), true)
  t.is(await driver.supportsTransactionConfig(), true)
  t.is(await driver.supportsUserImpersonation(), true)
  t.is(await driver.supportsSessionAuth(), true)
  t.is(driver.isEncrypted(), false)
  t.is(await driver.close(), undefined)
})
