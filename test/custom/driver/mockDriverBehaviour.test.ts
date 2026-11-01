import test from 'ava';
import { EagerResult } from 'neo4j-driver';
import { mockDriver, mockSessionFromQuerySet, mockSessionFromFunction } from '../../../src';
import { MockDriver } from '../../../src/custom/driver/mockDriver';
import { QuerySpec } from '../../../src/custom/types/QuerySpec';

const query = 'MATCH (p:Person) RETURN p.name AS name, p.age AS age';
const querySet: QuerySpec[] = [
  {
    query,
    output: {
      records: [
        { keys: ['name', 'age'], length: 2, _fields: ['Alice', { low: 30, high: 0 }], _fieldLookup: { name: 0, age: 1 } },
        { keys: ['name', 'age'], length: 2, _fields: ['Bob', { low: 25, high: 0 }], _fieldLookup: { name: 0, age: 1 } },
      ],
      summary: { queryType: 'r', counters: { _stats: { nodesCreated: 0 } } },
    },
  },
];

test('mockDriver returns a MockDriver typed as a Driver', (t) => {
  const driver = mockDriver(mockSessionFromQuerySet(querySet));
  t.true((driver as unknown) instanceof MockDriver);
});

test('session() ignores a session config and returns the same session', (t) => {
  const session = mockSessionFromQuerySet(querySet);
  const driver: any = mockDriver(session);
  t.is(driver.session({ database: 'movies', defaultAccessMode: 'READ' }), session);
  t.is(driver.session(), session);
});

test('databaseInfo is accepted for backward compatibility', (t) => {
  const session = mockSessionFromQuerySet(querySet);
  const driver = mockDriver(session, { URI: 'neo4j://x', USER: 'u', PASSWORD: 'p' } as any);
  t.is(driver.session(), session);
});

test('executeQuery returns a real EagerResult with keys, records and summary', async (t) => {
  const driver = mockDriver(mockSessionFromQuerySet(querySet));
  const result = await driver.executeQuery(query);
  t.true(result instanceof EagerResult);
  t.deepEqual(result.keys, ['name', 'age']);
  t.is(result.records.length, 2);
  t.is(result.records[1].get('name'), 'Bob');
  t.is(result.records[1].get('age').toNumber(), 25);
  t.is(result.summary.queryType, 'r');
  t.false(result.summary.counters.containsUpdates());
});

test('executeQuery passes params through to the session', async (t) => {
  const seen: any[] = [];
  const session = mockSessionFromFunction((q, p) => {
    seen.push([q, p]);
    return mockSessionFromQuerySet(querySet).run(query);
  });
  await mockDriver(session).executeQuery('ANY', { id: 7 });
  t.deepEqual(seen, [['ANY', { id: 7 }]]);
});

test('executeQuery honours a custom resultTransformer', async (t) => {
  const driver = mockDriver(mockSessionFromQuerySet(querySet));
  const names = await driver.executeQuery(query, {}, {
    resultTransformer: async (result: any) => {
      const out: string[] = [];
      for await (const record of result) out.push(record.get('name'));
      return out;
    },
  });
  t.deepEqual(names, ['Alice', 'Bob']);
});

test('executeQuery rejects with the query-set error for an unknown query', async (t) => {
  const driver = mockDriver(mockSessionFromQuerySet(querySet));
  const error = await t.throwsAsync(() => driver.executeQuery('MATCH (x) RETURN x'));
  t.regex(error.message, /does not contain the given query/);
});

test('remaining public surface resolves with sensible defaults', async (t) => {
  const driver: any = mockDriver(mockSessionFromQuerySet(querySet));
  t.deepEqual(await driver.getServerInfo(), {});
  t.is(await driver.verifyAuthentication(), true);
  t.is(await driver.getNegotiatedProtocolVersion(), 5.0);
});
