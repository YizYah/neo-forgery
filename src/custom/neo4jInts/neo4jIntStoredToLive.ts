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
    item.high === 0 &&
    item.low &&
    (typeof item.low === 'number')
  ) {
    const actualValue = item.low;
    this.update(neo4j.int(actualValue));
  }
}
