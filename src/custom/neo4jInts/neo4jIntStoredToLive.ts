import { TraverseContext } from 'traverse';

const neo4j = require('neo4j-driver');

export function neo4jIntStoredToLive(this: TraverseContext, item: any) {
  if (!item ||
    Array.isArray(item) ||
    (typeof item === 'string') ||
    (typeof item === 'number')
  ) return;
  // A stored Integer is exactly `{ low, high }`; any such pair becomes a neo4j Integer.
  if (
    Object.keys(item).length === 2 &&
    (typeof item.low === 'number') &&
    (typeof item.high === 'number')
  ) {
    this.update(neo4j.int(item));
  }
}
