import { QuerySpec } from '../types/QuerySpec';
import Session from 'neo4j-driver-core/types/session';
import { storedToLive } from '../response/storedToLive';
import { Config } from 'neo4j-driver';
const isSubset = require('is-subset');

const neo4j = require('neo4j-driver');
const mockDatabaseInfo = {
  URI: 'neo4j+s://84751e18.databases.neo4j.io',
  USER: 'faker',
  PASSWORD: 'thisIsAfakeDatabase',
};


const queryInfo = (params: any, query: string): string => {
  let paramsString = JSON.stringify(params);
  const MAX_LENGTH = 1500;
  if (paramsString && paramsString.length > MAX_LENGTH) paramsString = paramsString.substring(0, MAX_LENGTH) + '...';
  return `
query:
-----------------
${query.trim()}
-----------------   
params: ${paramsString}
`

}
const errorMessageContentsQueryMatched = (params: any, query: string): string =>
  `your query was matched in your QuerySpec. But your params were not matched:
${queryInfo(params, query)}`;
const errorMessageContentsQueryNotMatched = (params: any, query: string): string =>
  `the query set provided does not contain the given query:
${queryInfo(params, query)}`;

function removeExtraWhite(inString: string): string {
  return inString.trim().replace(/\s+/g, ' ')
}


function mockSessionFromQuerySet(querySet: QuerySpec[], config?: Config): Session {
  const driver = neo4j.driver(
    mockDatabaseInfo.URI,
    neo4j.auth.basic(
      mockDatabaseInfo.USER,
      mockDatabaseInfo.PASSWORD,
    ), config
  );


  const fakeSession = driver.session();

  const mockRun = async (query: string, params: any) => {
    let queryMatched = false;

    for (let index = 0; index < querySet.length; index++) {
      const querySpec: QuerySpec = querySet[index];

      if (removeExtraWhite(querySpec.query) === removeExtraWhite(query)) {
        queryMatched = true;
        if (!querySpec.params || isSubset(params, querySpec.params)) {
          return storedToLive(querySpec.output);
        }
      }
    }

    const errorMessageMatchedQuery = errorMessageContentsQueryMatched(params, query);
    if (queryMatched) {
      throw new Error(errorMessageMatchedQuery)
    }

    const errorMessageNoMatchedQuery = errorMessageContentsQueryNotMatched(params, query)
    throw new Error(errorMessageNoMatchedQuery);
  };

  fakeSession._beginTransaction = function mockBeginTransaction(transactionType: string) {
    let _isOpen = true;
    return {
      run: async (query: string, params: any) => {
        const output = await mockRun(query, params)
        output.summary.transactionType = transactionType
        return output
      },
      commit: () => {
        _isOpen = false;
        return Promise.resolve();
      },
      rollback: () => {
        _isOpen = false;
        return Promise.resolve();
      },
      isOpen: () => _isOpen,
    };
  }

  fakeSession.run = mockRun;
  // fakeSession._beginTransaction = mockBeginTransaction;

  return fakeSession;
}

module.exports = mockSessionFromQuerySet;
