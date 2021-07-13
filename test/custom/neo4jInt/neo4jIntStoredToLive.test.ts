import { neo4jIntStoredToLive } from '../../../src/custom/neo4jInts/neo4jIntStoredToLive';
import traverse = require('traverse');

const test = require('ava');


test('neo4jIntStoredToLive', (t:any) => {
  const tree = [{
    'identity': { 'low': 4499, 'high': 0 },
    'labels': ['App', 'Exported'],
    'properties': { 'value': 'value1', 'id': 'id1' },
  }];

  const result = traverse(tree).map(neo4jIntStoredToLive);
  console.log(`result[0] = ${JSON.stringify(result[0], null, 2)}`)
  // this tests the conversion of the neo4j int
  t.is(result[0].identity.low, 4499)
  t.is(result[0].identity.high, 0)

});


test('neo4jIntStoredToLive null', (t:any) => {
  const tree = null;

  const result = traverse(tree).map(neo4jIntStoredToLive);
  t.is(result, null)

});
