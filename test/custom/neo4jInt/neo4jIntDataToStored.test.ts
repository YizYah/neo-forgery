import test from 'ava';
import traverse = require('traverse');
import { neo4jIntDataToStored } from '../../../src/custom/neo4jInts/neo4jIntDataToStored';
import { neo4jIntStoredToData } from '../../../src/custom/neo4jInts/neo4jIntStoredToData';

const toStored = (tree: any) => traverse(tree).map(neo4jIntDataToStored);
const roundTrip = (tree: any) => traverse(toStored(tree)).map(neo4jIntStoredToData);

test('positive integer becomes { high: 0, low: n }', (t) => {
  t.deepEqual(toStored([{ n: 4499 }]), [{ n: { high: 0, low: 4499 } }]);
});

test('zero becomes { high: 0, low: 0 }', (t) => {
  t.deepEqual(toStored([{ n: 0 }]), [{ n: { high: 0, low: 0 } }]);
});

test('negative integer gets high: -1 and round-trips', (t) => {
  t.deepEqual(toStored([{ n: -5 }]), [{ n: { high: -1, low: -5 } }]);
  t.deepEqual(roundTrip([{ n: -5 }]), [{ n: -5 }]);
});

test('integers above 2^32 round-trip', (t) => {
  const big = 2 ** 40 + 3;
  t.deepEqual(roundTrip([{ n: big }]), [{ n: big }]);
});

test('non-integer numbers are left as floats', (t) => {
  t.deepEqual(toStored([{ ratio: 3.5 }]), [{ ratio: 3.5 }]);
});

test('strings, booleans and null are untouched', (t) => {
  const tree = [{ s: '42', b: true, nothing: null }];
  t.deepEqual(toStored(tree), tree);
});

test('integers nested in objects and arrays are converted', (t) => {
  t.deepEqual(toStored([{ a: { b: [1, { c: 2 }] } }]), [
    { a: { b: [{ high: 0, low: 1 }, { c: { high: 0, low: 2 } }] } },
  ]);
});
