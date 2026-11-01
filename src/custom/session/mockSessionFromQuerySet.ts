import { Config, Session } from 'neo4j-driver';
import { QuerySpec } from '../types/QuerySpec';
import { MockSession } from './MockSession';
import { Runner } from '../transaction/MockTransaction';
import { matchQuerySet } from '../result/matchQuerySet';
import { makeResult, makeErrorResult } from '../result/makeResult';

// Builds a runner that answers each query from the query set with a real neo4j-driver
// `Result`, or with a failing `Result` carrying the original (unchanged) error message.
function querySetRunner(querySet: QuerySpec[]): Runner {
  return (query: string, params?: any) => {
    try {
      const storedResponse = matchQuerySet(querySet, query, params);
      return makeResult(query, params, storedResponse);
    } catch (error) {
      return makeErrorResult(query, params, error as Error);
    }
  };
}

export function mockSessionFromQuerySet(querySet: QuerySpec[], config?: Config): Session {
  return new MockSession(querySetRunner(querySet), config) as unknown as Session;
}
