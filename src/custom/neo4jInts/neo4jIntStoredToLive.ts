import { TraverseContext } from 'traverse';

const neo4j = require('neo4j-driver');

export function neo4jIntStoredToLive(this: TraverseContext, item: any) {
  if (!item ||
    Array.isArray(item) ||
    (typeof item === 'string') ||
    (typeof item === 'number')
  ) return;
  if (
    Object.keys(item).length === 2 &&
    (typeof item.low === 'number') &&
    (item.high === 0 || item.high === -1)
  ) {
    this.update(neo4j.int(item));
  }
}
