import { TraverseContext } from 'traverse';

const neo4j = require('neo4j-driver');

export function neo4jIntDataToLive(this: TraverseContext, item: any) {
  if ((typeof item) === 'number') {
    this.update(neo4j.int(item), true);
  }
}
