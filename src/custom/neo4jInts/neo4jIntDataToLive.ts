import { TraverseContext } from 'traverse';

const neo4j = require('neo4j-driver');

// Converts plain JS integers in "data" format to neo4j `Integer`s. Non-integer numbers are
// left alone, matching what the driver returns for Neo4j floats.
export function neo4jIntDataToLive(this: TraverseContext, item: any) {
  if (typeof item === 'number' && Number.isInteger(item)) {
    this.update(neo4j.int(item), true);
  }
}
