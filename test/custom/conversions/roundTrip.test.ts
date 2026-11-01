import test from 'ava';
import { isInt, Record } from 'neo4j-driver';
import {
  dataToLive, dataToStored, storedToLive, storedToData, liveToStored, liveToData, wrapCopiedResults,
} from '../../../src';

const data = [
  { id: 1, name: 'Alice', tags: ['a', 'b'], props: { age: 30, score: 9.5, active: true, nothing: null } },
  { id: -2, name: 'Bob', tags: [], props: { age: 0, score: 0.5, active: false, nothing: null } },
];

test('data → stored → data is lossless, including negatives, zero and floats', (t) => {
  t.deepEqual(storedToData(dataToStored(data)), data);
});

test('data → live → data is lossless', (t) => {
  t.deepEqual(liveToData(dataToLive(data)), data);
});

test('data → live → stored → live → data is lossless', (t) => {
  const live = dataToLive(data);
  const stored = liveToStored(live);
  t.deepEqual(liveToData(storedToLive(stored)), data);
});

test('dataToLive produces real Records with typed values', (t) => {
  const [row] = dataToLive(data).records;
  t.true(row instanceof Record);
  t.deepEqual(row.keys, ['id', 'name', 'tags', 'props']);
  t.true(isInt(row.get('id')));
  t.is(row.get('name'), 'Alice');
  t.true(isInt(row.get('props').age));
  t.is(row.get('props').score, 9.5);
  t.is(row.get('props').nothing, null);
  t.deepEqual(row.toObject().tags, ['a', 'b']);
});

test('dataToStored writes the stored record shape with a field lookup', (t) => {
  const [rec] = dataToStored([{ a: 'x', b: 2 }]).records;
  t.deepEqual(rec.keys, ['a', 'b']);
  t.is(rec.length, 2);
  t.deepEqual(rec._fieldLookup, { a: 0, b: 1 });
  t.deepEqual(rec._fields, ['x', { high: 0, low: 2 }]);
});

test('storedToData honours the field lookup rather than field order', (t) => {
  const stored = {
    records: [{ keys: ['second', 'first'], length: 2, _fields: ['one', 'two'], _fieldLookup: { first: 0, second: 1 } }],
  };
  t.deepEqual(storedToData(stored), [{ second: 'two', first: 'one' }]);
});

test('storedToLive copies the summary instead of sharing it', (t) => {
  const summary = { queryType: 'r' };
  const live = storedToLive({ records: [], summary });
  t.deepEqual(live.summary, summary);
  t.not(live.summary, summary);
});

test('empty inputs convert to empty outputs', (t) => {
  t.deepEqual(dataToLive([]).records, []);
  t.deepEqual(dataToStored([]).records, []);
  t.deepEqual(storedToData({ records: [] }), []);
  t.deepEqual(liveToData({ records: [], summary: {} }), []);
});

test('wrapCopiedResults defaults the summary to an empty object and keeps a given one', (t) => {
  const records = dataToStored([{ a: 1 }]).records;
  t.deepEqual(wrapCopiedResults(records), { records, summary: {} });
  t.deepEqual(wrapCopiedResults(records, { queryType: 'w' }).summary, { queryType: 'w' });
});

test('liveToStored serialises Integers to { low, high }', (t) => {
  const stored = liveToStored(dataToLive([{ n: -7 }]));
  t.deepEqual(stored.records[0]._fields[0], { low: -7, high: -1 });
});
