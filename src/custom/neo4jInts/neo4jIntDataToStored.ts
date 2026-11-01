import { TraverseContext } from 'traverse';

const neo4j = require('neo4j-driver');

// Converts plain JS integers in "data" format to the stored `{ low, high }` shape.
// `neo4j.int` computes the correct two's-complement halves, so negative numbers and values
// above 2^32 round-trip (a hand-rolled `{ high: 0, low: item }` did not). Non-integer
// numbers are left alone: Neo4j floats come back from the driver as plain JS numbers.
export function neo4jIntDataToStored(this: TraverseContext, item: any) {
  if (typeof item === 'number' && Number.isInteger(item)) {
    const { low, high } = neo4j.int(item);
    this.update({ high, low }, true);
  }
}
