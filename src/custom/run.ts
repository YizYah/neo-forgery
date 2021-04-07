import {SessionInfo, ParamInfo} from './SessionInfo'
const deepEqual = require('deep-equal')
export function run(sessionInfo: SessionInfo, query: string, params: any){
  const queryInfo = sessionInfo[query]
  if (!queryInfo) throw new Error(`query was called that is not in the sample session: '${query}'`)
  let returned: any = null
  queryInfo.map((paramInfo: ParamInfo) => {
    if (deepEqual(paramInfo.params,params)) {
      returned = paramInfo.responses[0]
      if (paramInfo.isMultiple) {
        if (paramInfo.currentResponse === undefined) throw new Error(
          'currentResponse not defined for multiple response query ${query} with params ${JSON.stringify(paramInfo.params)}'
        )
        if (!paramInfo.responses[paramInfo.currentResponse]) throw new Error(
          `maximum number of answers exceeded for query ${query} with params ${JSON.stringify(paramInfo.params)}`
        )
        returned = paramInfo.responses[paramInfo.currentResponse]
        paramInfo.currentResponse = paramInfo.currentResponse + 1
      }
    }
  })
  if (returned) return returned

  throw new Error(
    `query was called with params that are not in the sample session: '${JSON.stringify(params)}'`
  )

}
