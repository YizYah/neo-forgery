import { QuerySpec } from '../types/QuerySpec';
import Session from 'neo4j-driver-core/types/session';
import { storedToLive } from '../response/storedToLive';

const neo4j = require('neo4j-driver');
const mockDatabaseInfo = {
  URI: 'neo4j+s://84751e18.databases.neo4j.io',
  USER: 'faker',
  PASSWORD: 'thisIsAfakeDatabase',
};

function mockSessionFromQuerySet(querySet: QuerySpec[]): Session {
  const driver = neo4j.driver(
    mockDatabaseInfo.URI,
    neo4j.auth.basic(
      mockDatabaseInfo.USER,
      mockDatabaseInfo.PASSWORD,
    ),
  );


  const fakeSession = driver.session();
  const mockRun = async (query: string, params: any) => {
    let queryMatched = false;
    let output: any = '';
    querySet.map((querySpec: QuerySpec) => {
      if (querySpec.query.trim() === query.trim()) {
        queryMatched = true;
        if (JSON.stringify(querySpec.params) === JSON.stringify(params)) {
          output = storedToLive(querySpec.output);
        }
      }
    });

    if (output !== '') return output;
    if (queryMatched) {
      let paramsString = JSON.stringify(params)
      const MAX_LENGTH = 150
      if (paramsString.length > MAX_LENGTH) paramsString = paramsString.substring(0, MAX_LENGTH) + '...'
      throw new Error(`your query was matched in your QuerySpec. But your params were not matched.

query:
-----------------
${query.trim()}
-----------------   
params: ${paramsString}
   
   `)
    }

    throw new Error(`the query set provided does not contain the given query:
-----------------
${query.trim()}
-----------------   
`);
  };

  const mockBeginTransaction = () => {
    let _isOpen = true;
    return {
      run: mockRun,
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
  };

  fakeSession.run = mockRun;
  fakeSession._beginTransaction = mockBeginTransaction;

  return fakeSession;
}

module.exports = mockSessionFromQuerySet;
