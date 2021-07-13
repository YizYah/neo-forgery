import { TraverseContext } from 'traverse';

export function neo4jIntStoredToData(this: TraverseContext, item: any) {
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
  )
    this.update(item.low);
}

