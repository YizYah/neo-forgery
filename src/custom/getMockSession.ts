import {SessionInfo} from './SessionInfo'
import {run} from './run'

export function addMultipleToSessionInfo(sessionInfo: SessionInfo) {
  const finalSessionInfo: SessionInfo = JSON.parse(JSON.stringify(sessionInfo))
  const queries = Object.keys(finalSessionInfo)
  queries.map(query => {
    const queryInfo = finalSessionInfo[query]
    queryInfo.map(paramsInfo => {
      const {responses} = paramsInfo
      if (!responses) throw new Error(
        `no response given for query '${query}' with 'params ${JSON.stringify(paramsInfo.params)}'`,
      )
      if (responses.length === 0) throw new Error(
        `empty response list given for query '${query}' with params '${JSON.stringify(paramsInfo.params)}'`,
      )
      if (responses.length > 1) {
        paramsInfo.isMultiple = true
        paramsInfo.currentResponse = 0
      }
    })
  })

  return finalSessionInfo
}


export function getMockSession(sessionInfo: SessionInfo) {
  const finalSessionInfo: SessionInfo = addMultipleToSessionInfo(sessionInfo)

  return {
    sessionInfo: finalSessionInfo,
    run: function (query: string, params: any) {
      /* istanbul ignore next */
      return run(this.sessionInfo, query, params)
    },
  }
}
