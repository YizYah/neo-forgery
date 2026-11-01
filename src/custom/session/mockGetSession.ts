import { Session } from 'neo4j-driver';
import { QuerySpec } from '../types/QuerySpec';
import { mockSessionFromQuerySet } from './mockSessionFromQuerySet';
import { mockDriver } from '../driver/mockDriver';

// Convenience helper (issue #37): build a mock driver from a query set and immediately hand
// back a ready-to-use mock session.
export function mockGetSession(querySet: QuerySpec[]): Session {
  return mockDriver(mockSessionFromQuerySet(querySet)).session();
}
