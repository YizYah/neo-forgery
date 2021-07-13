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
