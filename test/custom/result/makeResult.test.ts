import test from 'ava';
import { Result, ResultSummary } from 'neo4j-driver';
import { mockSessionFromQuerySet } from '../../../src';
import { QuerySpec } from '../../../src/custom/types/QuerySpec';

const query = 'MATCH (n) RETURN n.name AS name, n.age AS age';

const querySet: QuerySpec[] = [
  {
    query,
    output: {
      records: [
        { keys: ['name', 'age'], length: 2, _fields: ['Alice', { low: 30, high: 0 }], _fieldLookup: { name: 0, age: 1 } },
        { keys: ['name', 'age'], length: 2, _fields: ['Bob', { low: 25, high: 0 }], _fieldLookup: { name: 0, age: 1 } },
      ],
      summary: {
        queryType: 'r',
        counters: { _stats: { nodesCreated: 0 } },
        updateStatistics: { _stats: { nodesCreated: 0 } },
        database: { name: 'neo4j' },
      },
    },
  },
];

const run = () => mockSessionFromQuerySet(querySet).run(query, {});

test('run() returns a real Result', (t) => {
  t.true(run() instanceof Result);
});

test('await yields records and summary', async (t) => {
  const { records, summary } = await run();
  t.is(records.length, 2);
  t.is(records[0].get('name'), 'Alice');
  t.true(summary instanceof ResultSummary);
});

test('awaited QueryResult exposes .records', async (t) => {
  const queryResult: any = await run();
  t.is(queryResult.records.length, 2);
  t.is(queryResult.records[1].get('name'), 'Bob');
});

test('.keys() resolves the field keys', async (t) => {
  t.deepEqual(await run().keys(), ['name', 'age']);
});

test('for await iterates every record', async (t) => {
  const names: string[] = [];
  for await (const record of run()) {
    names.push(record.get('name'));
  }
  t.deepEqual(names, ['Alice', 'Bob']);
});

test('.summary() returns a real ResultSummary with working counters', async (t) => {
  const summary = await run().summary();
  t.true(summary instanceof ResultSummary);
  t.is(typeof summary.counters.updates, 'function');
  t.false(summary.counters.containsUpdates());
  t.is(summary.database.name, 'neo4j');
});

test('.subscribe() replays onKeys, onNext per record, then onCompleted', async (t) => {
  await new Promise<void>((resolve, reject) => {
    const events: string[] = [];
    run().subscribe({
      onKeys: (keys) => events.push('keys:' + keys.join(',')),
      onNext: (record) => events.push('next:' + record.get('name')),
      onCompleted: () => {
        events.push('completed');
        try {
          t.deepEqual(events, ['keys:name,age', 'next:Alice', 'next:Bob', 'completed']);
          resolve();
        } catch (e) {
          reject(e);
        }
      },
      onError: reject,
    });
  });
});

test('.as() maps rows with Rules (driver 6)', async (t) => {
  // `.as()` only exists on neo4j-driver 6; the suite also runs against 5.x,
  // so look it up dynamically and skip there.
  const result = run() as any;
  if (typeof result.as !== 'function') {
    t.pass('neo4j-driver 5.x has no Result.as()');
    return;
  }
  const { records } = await result.as({
    name: {},
    age: { convert: (value: any) => value.toNumber() },
  });
  t.deepEqual(records, [
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 25 },
  ]);
});

test('error path: await rejects, for await throws, subscribe calls onError', async (t) => {
  const session = mockSessionFromQuerySet(querySet);

  const awaitError = await t.throwsAsync(() => session.run('NOPE', {}) as any);
  t.regex((awaitError as Error).message, /does not contain the given query/);

  const iterError = await t.throwsAsync(async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for await (const _ of session.run('NOPE', {}) as any) { /* no-op */ }
  });
  t.regex((iterError as Error).message, /does not contain the given query/);

  await new Promise<void>((resolve, reject) => {
    (session.run('NOPE', {}) as any).subscribe({
      onError: (error: Error) => {
        try {
          t.regex(error.message, /does not contain the given query/);
          resolve();
        } catch (e) {
          reject(e);
        }
      },
    });
  });
});
