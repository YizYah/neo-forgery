/* ns__file unit: standard, comp: test/index.test.ts */
/* ns__start_section imports */
import test from 'ava';
/* ns__custom_start customImports */
const indexFile = require( '../src/index' )

const mockSessionFromQuerySet = require('../src/custom/session/mockSessionFromQuerySet')
const mockSessionFromFunction = require('../src/custom/session/mockSessionFromFunction')
const {mockResultsFromCapturedOutput} = require('../src/custom/results/mockResultsFromCapturedOutput')
const {mockResultsFromData} = require('../src/custom/results/mockResultsFromData')
const {testQuerySet} = require('../src/custom/session/testQuerySet')
/* ns__custom_end customImports */


/* ns__end_section imports */

/* ns__custom_start general */

test('general', t => {

  t.deepEqual(
      mockResultsFromCapturedOutput,
      indexFile.mockResultsFromCapturedOutput
  )
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
});
/* ns__custom_end general */
