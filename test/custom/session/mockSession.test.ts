import test from 'ava';
import { MockSession } from '../../../src/custom/session/MockSession';
import { MockTransaction } from '../../../src/custom/transaction/MockTransaction';

// A runner that records what it was called with and returns a result-like object.
function recordingRunner() {
  const calls: { query: string; params: any }[] = [];
  const runner = (query: string, params?: any) => {
    calls.push({ query, params });
    return { records: [], summary: {} };
  };
  return { calls, runner };
}

test('run() passes query and params straight to the runner', (t) => {
  const { calls, runner } = recordingRunner();
  const session = new MockSession(runner);
  session.run('RETURN $x', { x: 1 });
  t.deepEqual(calls, [{ query: 'RETURN $x', params: { x: 1 } }]);
});

test('run() without params passes undefined', (t) => {
  const { calls, runner } = recordingRunner();
  new MockSession(runner).run('RETURN 1');
  t.is(calls[0].params, undefined);
});

test('beginTransaction() returns an open MockTransaction sharing the runner', (t) => {
  const { calls, runner } = recordingRunner();
  const tx = new MockSession(runner).beginTransaction();
  t.true(tx instanceof MockTransaction);
  t.true(tx.isOpen());
  tx.run('CREATE (n)', { a: 2 });
  t.deepEqual(calls, [{ query: 'CREATE (n)', params: { a: 2 } }]);
});

test('executeRead stamps READ and executeWrite stamps WRITE on the summary', async (t) => {
  const { runner } = recordingRunner();
  const session = new MockSession(runner);
  const read = await session.executeRead((tx) => tx.run('MATCH (n) RETURN n'));
  const write = await session.executeWrite((tx) => tx.run('CREATE (n)'));
  t.is(read.summary.transactionType, 'READ');
  t.is(write.summary.transactionType, 'WRITE');
});

test('readTransaction / writeTransaction are aliases of executeRead / executeWrite', async (t) => {
  const { runner } = recordingRunner();
  const session = new MockSession(runner);
  const read = await session.readTransaction((tx) => tx.run('MATCH (n) RETURN n'));
  const write = await session.writeTransaction((tx) => tx.run('CREATE (n)'));
  t.is(read.summary.transactionType, 'READ');
  t.is(write.summary.transactionType, 'WRITE');
});

test('managed work may return anything; non-objects are returned untouched', async (t) => {
  const session = new MockSession(() => ({ records: [], summary: {} }));
  t.is(await session.executeRead(() => 42), 42);
  t.is(await session.executeWrite(() => undefined), undefined);
  t.is(await session.executeRead(() => 'done'), 'done');
});

test('managed work returning an object without a summary is returned untouched', async (t) => {
  const session = new MockSession(() => ({ records: [] }));
  const value = { records: [1, 2] };
  const out = await session.executeWrite(() => value);
  t.is(out, value);
  t.false('summary' in out);
});

test('managed work receives a fresh transaction each time', async (t) => {
  const session = new MockSession(() => ({}));
  const seen: MockTransaction[] = [];
  await session.executeRead((tx) => { seen.push(tx); return {}; });
  await session.executeRead((tx) => { seen.push(tx); return {}; });
  t.not(seen[0], seen[1]);
  t.true(seen[0].isOpen());
});

test('an error thrown inside managed work rejects the managed call', async (t) => {
  const session = new MockSession(() => ({}));
  const error = await t.throwsAsync(() =>
    session.executeWrite(() => { throw new Error('boom'); }),
  );
  t.is(error.message, 'boom');
});

test('lastBookmarks() and lastBookmark() return empty arrays', (t) => {
  const session = new MockSession(() => ({}));
  t.deepEqual(session.lastBookmarks(), []);
  t.deepEqual(session.lastBookmark(), []);
});

test('close() resolves', async (t) => {
  t.is(await new MockSession(() => ({})).close(), undefined);
});

test('a session config is accepted and ignored', (t) => {
  const { calls, runner } = recordingRunner();
  const session = new MockSession(runner, { database: 'neo4j' } as any);
  session.run('RETURN 1');
  t.is(calls.length, 1);
});
