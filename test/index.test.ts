/* ns__file unit: standard, comp: test/index.test.ts */
/* ns__start_section imports */
import test from 'ava';
/* ns__custom_start customImports */
const indexFile = require( '../src/index' )
import { mockDriver } from '../src/custom/driver/mockDriver';

import { mockSessionFromQuerySet } from '../src/custom/session/mockSessionFromQuerySet'
import { mockSessionFromFunction } from '../src/custom/session/mockSessionFromFunction'
import { mockGetSession } from '../src/custom/session/mockGetSession'
import { mockResultsFromData, mockResultsFromCapturedOutput } from '../src/custom/response/dataToLive'
import { testQuerySet } from '../src/custom/session/testQuerySet'

// conversions
import { dataToLive } from '../src/custom/response/dataToLive'
import { dataToStored } from '../src/custom/response/dataToStored'
import { storedToLive } from '../src/custom/response/storedToLive'
import { storedToData } from '../src/custom/response/storedToData'
import { liveToStored } from '../src/custom/response/liveToStored'
import { liveToData } from '../src/custom/response/liveToData'
import { wrapCopiedResults } from '../src/custom/response/wrapCopiedResults'


// utilities
import { getDatabaseInfo } from '../src/custom/database/getDatabaseInfo'

/* ns__custom_end customImports */


/* ns__end_section imports */

/* ns__custom_start general */

test('conversion functions available', t => {
  t.is(liveToStored, indexFile.liveToStored)
  t.is(liveToData, indexFile.liveToData)
  t.is(dataToStored, indexFile.dataToStored)
  t.is(dataToLive, indexFile.dataToLive)
  t.is(storedToLive, indexFile.storedToLive)
  t.is(storedToData, indexFile.storedToData)
  t.is(wrapCopiedResults, indexFile.wrapCopiedResults)
})

test('general', t => {
  t.is(mockSessionFromQuerySet, indexFile.mockSessionFromQuerySet)
  t.is(mockSessionFromFunction, indexFile.mockSessionFromFunction)
  t.is(mockGetSession, indexFile.mockGetSession)
  t.is(mockResultsFromData, indexFile.mockResultsFromData)
  t.is(mockResultsFromCapturedOutput, indexFile.mockResultsFromCapturedOutput)
  t.is(testQuerySet, indexFile.testQuerySet)
  t.is(mockDriver, indexFile.mockDriver)
  t.is(getDatabaseInfo, indexFile.getDatabaseInfo)
})
/* ns__custom_end general */
