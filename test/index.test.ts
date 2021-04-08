/* ns__file unit: standard, comp: test/index.test.ts */
/* ns__start_section imports */
import test from 'ava';
/* ns__custom_start customImports */
import {SessionInfo} from '../src/index'
const getMockSession = require('../src/index')
import {expectedResult, nonExistentParams, nonExistentQuery, params, query, secondExpectedResult} from './custom/queryInfo'
/* ns__custom_end customImports */


/* ns__end_section imports */

/* ns__custom_start general */
const sessionInfo: SessionInfo = {
  [query]: [
    {
      params,
      responses: [
        expectedResult,
        secondExpectedResult,
      ],
    },
  ]
}

const sessionInfoEmptyResponses: SessionInfo = {
  [query]: [
    {
      params,
      responses: [
      ],
    },
  ]
}


const sessionInfoMissingResponses = {
  [query]: [
    {
      params,
    },
  ]
}


test('general', t => {
  let session = getMockSession(sessionInfo)
  t.is(session.sessionInfo[query][0].isMultiple,true)
  t.is(session.sessionInfo[query][0].currentResponse,0)
  t.not(sessionInfo[query][0].isMultiple,true)
  t.notDeepEqual(session.sessionInfo, sessionInfo)

  // confirm missing responses error
  let error = t.throws(() => {
    session = getMockSession(sessionInfoMissingResponses)
  });
  t.regex(error.message, /no response given for query/);

  // test confirm no responses error
  error = t.throws(() => {
    session = getMockSession(sessionInfoEmptyResponses)
  });
  t.regex(error.message, /empty response list given for query/);


  let result = session.run(query, params).then(
    (result: any) => {
      t.deepEqual(result, expectedResult)
    }
  )
  // t.deepEqual(result, expectedResult)
  // result = session.run(query, params)
  // t.deepEqual(result, secondExpectedResult)
});
/* ns__custom_end general */
