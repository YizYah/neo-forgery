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

// const DataBaseInfoModule = require('../src/custom/types/DatabaseInfo')
// const QuerySpecModule = require('../src/custom/types/QuerySpec')
// const MockOutputModule = require('../src/custom/types/MockOutput')
// const ReturnedDataRecordModule = require('../src/custom/types/ReturnedDataRecord')

// const getMockSession = require('../src/index')
// import {expectedResult, nonExistentParams, nonExistentQuery, params, query, secondExpectedResult} from './custom/data/queryInfo'
/* ns__custom_end customImports */


/* ns__end_section imports */

/* ns__custom_start general */
// const sessionInfo: SessionInfo = {
//   [query]: [
//     {
//       params,
//       responses: [
//         expectedResult,
//         secondExpectedResult,
//       ],
//     },
//   ]
// }
//
// const sessionInfoEmptyResponses: SessionInfo = {
//   [query]: [
//     {
//       params,
//       responses: [
//       ],
//     },
//   ]
// }
//
//
// const sessionInfoMissingResponses = {
//   [query]: [
//     {
//       params,
//     },
//   ]
// }


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
  // let session = getMockSession(sessionInfo)
  // t.is(session.sessionInfo[query][0].isMultiple,true)
  // t.is(session.sessionInfo[query][0].currentResponse,0)
  // t.not(sessionInfo[query][0].isMultiple,true)
  // t.notDeepEqual(session.sessionInfo, sessionInfo)
  //
  // // confirm missing responses error
  // let error = t.throws(() => {
  //   session = getMockSession(sessionInfoMissingResponses)
  // });
  // t.regex(error.message, /no response given for query/);
  //
  // // test confirm no responses error
  // error = t.throws(() => {
  //   session = getMockSession(sessionInfoEmptyResponses)
  // });
  // t.regex(error.message, /empty response list given for query/);
  //
  //
  // let result = session.run(query, params).then(
  //   (result: any) => {
  //     t.deepEqual(result, expectedResult)
  //   }
  // )
});
/* ns__custom_end general */
