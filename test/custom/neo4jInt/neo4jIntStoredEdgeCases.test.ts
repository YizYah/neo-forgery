import test from 'ava';
import traverse = require('traverse');
import { isInt } from 'neo4j-driver';
import { neo4jIntStoredToData } from '../../../src/custom/neo4jInts/neo4jIntStoredToData';
import { neo4jIntStoredToLive } from '../../../src/custom/neo4jInts/neo4jIntStoredToLive';

// Objects that merely resemble a stored Integer must not be converted.

test('an object with low/high plus a third key is not an Integer', (t) => {
  const tree = [{ v: { low: 1, high: 0, extra: true } }];
  t.deepEqual(traverse(tree).map(neo4jIntStoredToData), tree);
  t.false(isInt(traverse(tree).map(neo4jIntStoredToLive)[0].v));
});

test('values that fit a JS number convert even when high is not 0/-1', (t) => {
  const tree = [{ v: { low: 3, high: 256 } }]; // 2^40 + 3
  t.deepEqual(traverse(tree).map(neo4jIntStoredToData), [{ v: 2 ** 40 + 3 }]);
});

test('values beyond 2^53 are left as { low, high } rather than rounded', (t) => {
  const tree = [{ v: { low: 0, high: 1 << 22 } }]; // 2^54
  t.deepEqual(traverse(tree).map(neo4jIntStoredToData), tree);
  t.true(isInt(traverse(tree).map(neo4jIntStoredToLive)[0].v));
});

test('low that is not a number is left alone', (t) => {
  const tree = [{ v: { low: '1', high: 0 } }];
  t.deepEqual(traverse(tree).map(neo4jIntStoredToData), tree);
});

test('strings, numbers, arrays and null pass through', (t) => {
  const tree = [{ s: 'x', n: 5, a: [1, 2], z: null }];
  t.deepEqual(traverse(tree).map(neo4jIntStoredToData), tree);
  t.deepEqual(traverse(tree).map(neo4jIntStoredToLive), tree);
});

test('Integers nested inside arrays convert', (t) => {
  const tree = [{ ids: [{ low: 1, high: 0 }, { low: -2, high: -1 }] }];
  t.deepEqual(traverse(tree).map(neo4jIntStoredToData), [{ ids: [1, -2] }]);
  const live = traverse(tree).map(neo4jIntStoredToLive)[0].ids;
  t.true(isInt(live[0]));
  t.is(live[1].toNumber(), -2);
});
