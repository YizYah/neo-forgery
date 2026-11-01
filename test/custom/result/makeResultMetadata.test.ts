import test from 'ava';
import { makeResult } from '../../../src/custom/result/makeResult';
import { StoredResponse } from '../../../src/custom/types/StoredResponse';

const record = (fields: any[], keys: string[]) => ({
  keys,
  length: keys.length,
  _fields: fields,
  _fieldLookup: Object.fromEntries(keys.map((k, i) => [k, i])),
});

const summaryOf = async (summary: any, records: any[] = [record(['x'], ['a'])]) => {
  const stored: StoredResponse = { records, summary };
  return (await makeResult('Q', {}, stored)).summary;
};

test('no stored summary still yields a usable ResultSummary', async (t) => {
  const s = await summaryOf(undefined);
  t.false(s.counters.containsUpdates());
  t.deepEqual(s.counters.updates().nodesCreated, 0);
  t.is(s.database.name, null);
});

test('keys come from the first record; an empty response has no keys', async (t) => {
  const withRecords: any = makeResult('Q', {}, { records: [record([1, 2], ['a', 'b'])] });
  t.deepEqual(await withRecords.keys(), ['a', 'b']);
  const empty: any = makeResult('Q', {}, { records: [] });
  t.deepEqual(await empty.keys(), []);
  t.is((await empty).records.length, 0);
});

test('query text and params are reported on the summary', async (t) => {
  const result = await makeResult('MATCH (n) RETURN n', { p: 1 }, { records: [] });
  t.is(result.summary.query.text, 'MATCH (n) RETURN n');
  t.deepEqual(result.summary.query.parameters, { p: 1 });
});

test('counters._stats (4.x capture shape) drive counters.updates()', async (t) => {
  const s = await summaryOf({ counters: { _stats: { nodesCreated: 2, propertiesSet: 5 } } });
  t.true(s.counters.containsUpdates());
  t.is(s.counters.updates().nodesCreated, 2);
  t.is(s.counters.updates().propertiesSet, 5);
});

test('updateStatistics._stats (older capture shape) is accepted too', async (t) => {
  const s = await summaryOf({ updateStatistics: { _stats: { relationshipsCreated: 1 } } });
  t.is(s.counters.updates().relationshipsCreated, 1);
});

test('a bare stats object is accepted', async (t) => {
  const s = await summaryOf({ stats: { labelsAdded: 3 } });
  t.is(s.counters.updates().labelsAdded, 3);
});

test('queryType (or type) becomes summary.queryType', async (t) => {
  t.is((await summaryOf({ queryType: 'w' })).queryType, 'w');
  t.is((await summaryOf({ type: 'rw' })).queryType, 'rw');
});

// The driver stores timings as Integers on some versions and plain numbers on others.
const num = (v: any) => (typeof v === 'number' ? v : typeof v.toNumber === 'function' ? v.toNumber() : v.low);

test('timings are forwarded under both naming styles', async (t) => {
  const camel = await summaryOf({ resultAvailableAfter: { low: 5, high: 0 }, resultConsumedAfter: { low: 9, high: 0 } });
  t.is(num(camel.resultAvailableAfter), 5);
  t.is(num(camel.resultConsumedAfter), 9);
  const snake = await summaryOf({ result_available_after: { low: 1, high: 0 }, result_consumed_after: { low: 2, high: 0 } });
  t.is(num(snake.resultAvailableAfter), 1);
  t.is(num(snake.resultConsumedAfter), 2);
});

test('database name comes from database.name, or db as a fallback', async (t) => {
  t.is((await summaryOf({ database: { name: 'movies' } })).database.name, 'movies');
  t.is((await summaryOf({ db: 'books' })).database.name, 'books');
  t.is((await summaryOf({ database: {} })).database.name, null);
});

test('server info is forwarded', async (t) => {
  const s = await summaryOf({ server: { address: 'localhost:7687', protocolVersion: 5.4 } });
  t.is(s.server.address, 'localhost:7687');
});

test('a stored plan: false is omitted, a real plan is kept', async (t) => {
  const none = await summaryOf({ plan: false, profile: false });
  t.false(none.hasPlan());
  t.false(none.hasProfile());
  const some = await summaryOf({
    plan: { operatorType: 'ProduceResults', identifiers: ['n'], arguments: {}, children: [] },
  });
  t.true(some.hasPlan());
  t.is((some.plan as any).operatorType, 'ProduceResults');
});

test('a profile is forwarded and counts as a plan too', async (t) => {
  const s = await summaryOf({
    profile: { operatorType: 'ProduceResults', identifiers: [], arguments: {}, children: [], dbHits: 3, rows: 1 },
  });
  t.true(s.hasProfile());
  t.is((s.profile as any).dbHits, 3);
});

test('each call builds an independent Result (consumable more than once per query set)', async (t) => {
  const stored: StoredResponse = { records: [record(['x'], ['a'])] };
  const first = await makeResult('Q', {}, stored);
  const second = await makeResult('Q', {}, stored);
  t.not(first, second);
  t.is(first.records[0].get('a'), 'x');
  t.is(second.records[0].get('a'), 'x');
});
