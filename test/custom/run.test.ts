import test from 'ava'
import {SessionInfo} from '../../src/custom/SessionInfo'
import {addMultipleToSessionInfo} from '../../src/custom/getMockSession'
import {expectedResult, nonExistentParams, nonExistentQuery, params, query, secondExpectedResult} from './queryInfo'

const {run} = require('../../src/custom/run')

const singleQuery='foo'
const bogusParams = {
  dreams: 'sweet'
}
const singleQueryParams= {
  bogus: true,
  madeUp: 'totally',
}
const singleResponse='bar'

const sessionInfo: SessionInfo = {
  [query]: [
      {
        params,
        responses: [
          expectedResult,
          secondExpectedResult
        ]
      },

    {
      params: bogusParams,
      responses: [
        expectedResult
      ]
    }
    ],
  [singleQuery]: [
    {
      params: singleQueryParams,
      responses: [
        singleResponse
      ]
    }
  ]
}

const finalSessionInfo = addMultipleToSessionInfo(sessionInfo)

// console.log(`finalSessionInfo=${JSON.stringify(finalSessionInfo,null, 2)}`)

test('run', async t => {

  let result = await run(finalSessionInfo, query, params)
  t.deepEqual(result, expectedResult)

  result = await run(finalSessionInfo, query, params)
  t.deepEqual(result, secondExpectedResult)

  // too many runs of the same multiple query
  let error = await t.throwsAsync(async () => {
    result = await run(finalSessionInfo, query, params)
  });
  t.regex(error.message, /maximum number of answers exceeded for query/);

  // single response query multiple times
  result = await run(finalSessionInfo, singleQuery, singleQueryParams)
  t.deepEqual(result, singleResponse)
  result = await run(finalSessionInfo, singleQuery, singleQueryParams)
  t.deepEqual(result, singleResponse)


  // nonexistent Query
  error = await t.throwsAsync(async () => {
    result = await run(finalSessionInfo, nonExistentQuery, params)
  });
  t.regex(error.message, /query was called that is not in the sample session/);

  // nonexistent Params
  error = await t.throwsAsync(async () => {
    result = await run(finalSessionInfo, query, nonExistentParams)
  });
  t.regex(error.message, /query was called with params that are not in the sample session/);

  // nonexistent currentResponse in multiple response query
  finalSessionInfo[query][0].currentResponse = undefined
  error = await t.throwsAsync(async () => {
    result = await run(finalSessionInfo, query, params)
  });
  t.regex(error.message, /currentResponse not defined for multiple response query/);


});
