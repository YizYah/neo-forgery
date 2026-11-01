import { TraverseContext } from 'traverse';

const neo4j = require('neo4j-driver');

export function neo4jIntStoredToData(this: TraverseContext, item: any) {
  if (!item ||
    Array.isArray(item) ||
    (typeof item === 'string') ||
    (typeof item === 'number')
  ) return;
  // A stored Integer is exactly `{ low, high }`. Convert it whenever the value fits a JS
  // number without loss (|n| <= 2^53); larger values stay as-is rather than be rounded.
  if (
    Object.keys(item).length === 2 &&
    (typeof item.low === 'number') &&
    (typeof item.high === 'number')
  ) {
    const integer = neo4j.int(item);
    if (integer.inSafeRange()) this.update(integer.toNumber());
  }
}
