import test from 'ava';
import traverse = require('traverse');
import { isInt, int } from 'neo4j-driver';
import { neo4jIntDataToLive } from '../../../src/custom/neo4jInts/neo4jIntDataToLive';

const toLive = (tree: any) => traverse(tree).map(neo4jIntDataToLive);

test('integers become neo4j Integers', (t) => {
  const [row] = toLive([{ n: 7 }]);
  t.true(isInt(row.n));
  t.is(row.n.toNumber(), 7);
});

test('negative integers and zero convert exactly', (t) => {
  const [row] = toLive([{ neg: -12, zero: 0 }]);
  t.is(row.neg.toNumber(), -12);
  t.is(row.zero.toNumber(), 0);
});

test('floats stay plain numbers', (t) => {
  const [row] = toLive([{ ratio: 0.25 }]);
  t.false(isInt(row.ratio));
  t.is(row.ratio, 0.25);
});

test('nested integers convert, strings do not', (t) => {
  const [row] = toLive([{ props: { count: 3, label: '3' }, list: [1, 'a'] }]);
  t.true(row.props.count.equals(int(3)));
  t.is(row.props.label, '3');
  t.true(isInt(row.list[0]));
  t.is(row.list[1], 'a');
});
