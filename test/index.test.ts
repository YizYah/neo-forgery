/* ns__file unit: standard, comp: test/index.test.ts */
/* ns__start_section imports */
import test from 'ava';
/* ns__custom_start customImports */
const indexFile = require( '../src/index' )
import { mockDriver } from '../src/custom/driver/mockDriver';

const mockSessionFromQuerySet = require('../src/custom/session/mockSessionFromQuerySet')
const mockSessionFromFunction = require('../src/custom/session/mockSessionFromFunction')
const {mockResultsFromData} = require('../src/custom/response/dataToLive')
const {testQuerySet} = require('../src/custom/session/testQuerySet')

// conversions
export const {dataToLive} = require('../src/custom/response/dataToLive')
export const {dataToStored} = require('../src/custom/response/dataToStored')
export const {storedToLive} = require('../src/custom/response/storedToLive')
export const {storedToData} = require('../src/custom/response/storedToData')
export const {liveToStored} = require('../src/custom/response/liveToStored')
export const {liveToData} = require('../src/custom/response/liveToData')


// utilities
const {getDatabaseInfo} = require('../src/custom/database/getDatabaseInfo')

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
      mockResultsFromData,
      indexFile.mockResultsFromData
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
