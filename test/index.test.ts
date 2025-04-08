/* ns__file unit: standard, comp: test/index.test.ts */
/* ns__start_section imports */
import test from 'ava';
/* ns__custom_start customImports */
import * as indexFile from '../src/index';
import { mockDriver } from '../src/custom/driver/mockDriver';
import { mockSessionFromQuerySet } from '../src/custom/session/mockSessionFromQuerySet';
import { mockSessionFromFunction } from '../src/custom/session/mockSessionFromFunction';
import { dataToLive } from '../src/custom/response/dataToLive';
import { testQuerySet } from '../src/custom/session/testQuerySet';
import { dataToStored } from '../src/custom/response/dataToStored';
import { storedToLive } from '../src/custom/response/storedToLive';
import { storedToData } from '../src/custom/response/storedToData';
import { liveToStored } from '../src/custom/response/liveToStored';
import { liveToData } from '../src/custom/response/liveToData';
import { wrapCopiedResults } from '../src/custom/response/wrapCopiedResults';
import { getDatabaseInfo } from '../src/custom/database/getDatabaseInfo';

/* ns__custom_end customImports */


/* ns__end_section imports */

/* ns__custom_start general */

test('conversion functions available', t => {
  t.deepEqual(
    liveToStored,
    indexFile.liveToStored
  )
  t.deepEqual(
    liveToData,
    indexFile.liveToData
  )
  t.deepEqual(
    dataToStored,
    indexFile.dataToStored
  )
  t.deepEqual(
    dataToLive,
    indexFile.dataToLive
  )
  t.deepEqual(
    storedToLive,
    indexFile.storedToLive
  )
  t.deepEqual(
    storedToData,
    indexFile.storedToData
  )
  t.deepEqual(
    wrapCopiedResults,
    indexFile.wrapCopiedResults
  )
})

test('general', t => {
  t.deepEqual(
      mockSessionFromQuerySet,
      indexFile.mockSessionFromQuerySet
  )
  t.deepEqual(
      mockSessionFromFunction,
      indexFile.mockSessionFromFunction
  )

  t.deepEqual(
      testQuerySet,
      indexFile.testQuerySet
  )

  t.deepEqual(
    mockDriver,
    indexFile.mockDriver
  )

  t.deepEqual(
    getDatabaseInfo,
    indexFile.getDatabaseInfo
  )
});
/* ns__custom_end general */
