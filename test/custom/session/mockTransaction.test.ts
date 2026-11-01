import test from 'ava';
import { MockTransaction } from '../../../src/custom/transaction/MockTransaction';

test('starts open', (t) => {
  t.true(new MockTransaction(() => ({})).isOpen());
});

test('run() delegates to the runner and returns its value', (t) => {
  const tx = new MockTransaction((q, p) => ({ q, p }));
  t.deepEqual(tx.run('RETURN $a', { a: 1 }), { q: 'RETURN $a', p: { a: 1 } });
});

test('commit() closes the transaction', async (t) => {
  const tx = new MockTransaction(() => ({}));
  await tx.commit();
  t.false(tx.isOpen());
});

test('rollback() closes the transaction', async (t) => {
  const tx = new MockTransaction(() => ({}));
  await tx.rollback();
  t.false(tx.isOpen());
});

test('close() closes the transaction', async (t) => {
  const tx = new MockTransaction(() => ({}));
  await tx.close();
  t.false(tx.isOpen());
});

test('commit, rollback and close are idempotent and keep resolving', async (t) => {
  const tx = new MockTransaction(() => ({}));
  await tx.commit();
  await t.notThrowsAsync(() => tx.rollback());
  await t.notThrowsAsync(() => tx.close());
  await t.notThrowsAsync(() => tx.commit());
  t.false(tx.isOpen());
});

test('run() still works after close (the mock does not enforce state)', (t) => {
  const tx = new MockTransaction(() => 'ran');
  tx.close();
  t.is(tx.run('RETURN 1'), 'ran');
});
