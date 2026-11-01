import { neo4jIntStoredToData } from '../../../src/custom/neo4jInts/neo4jIntStoredToData';
import traverse = require('traverse');

const test = require('ava');

const tree = [{
  'identity': { 'low': 4499, 'high': 0 },
  'labels': ['App', 'Exported'],
  'properties': { 'value': 'value1', 'id': 'id1' },
}];

const expected = [{
  'identity': 4499,
  'labels': ['App', 'Exported'],
  'properties': { 'value': 'value1', 'id': 'id1' },
}];

test('neo4jIntStoredToData', (t:any) => {
  const result = traverse(tree).map(neo4jIntStoredToData);
  t.deepEqual(result, expected)
});

// issue #44: zero and negative lossless integers must convert
test('neo4jIntStoredToData converts zero (low:0, high:0)', (t:any) => {
  const result = traverse([{ 'identity': { 'low': 0, 'high': 0 } }]).map(neo4jIntStoredToData);
  t.is(result[0].identity, 0)
});

test('neo4jIntStoredToData converts negative (high:-1)', (t:any) => {
  const result = traverse([{ 'identity': { 'low': -1, 'high': -1 } }]).map(neo4jIntStoredToData);
  t.is(result[0].identity, -1)
});
