import test from 'ava';
import { matchQuerySet } from '../../../src/custom/result/matchQuerySet';
import { QuerySpec } from '../../../src/custom/types/QuerySpec';
import { StoredResponse } from '../../../src/custom/types/StoredResponse';

const out = (tag: string): StoredResponse => ({
  records: [{ keys: ['t'], length: 1, _fields: [tag], _fieldLookup: { t: 0 } }],
});

test('whitespace differences (tabs, newlines, runs of spaces, edges) are ignored', (t) => {
  const spec: QuerySpec = { query: 'MATCH (n)\n\tWHERE n.id = $id\n  RETURN n', output: out('a') };
  t.is(matchQuerySet([spec], '  MATCH (n) WHERE n.id = $id RETURN n ', {}), spec.output);
});

test('whitespace inside tokens still matters', (t) => {
  const spec: QuerySpec = { query: 'MATCH (n) RETURN n', output: out('a') };
  t.throws(() => matchQuerySet([spec], 'MATCH (n) RETURNn', {}), { message: /does not contain/ });
});

test('matching is case-sensitive', (t) => {
  const spec: QuerySpec = { query: 'MATCH (n) RETURN n', output: out('a') };
  t.throws(() => matchQuerySet([spec], 'match (n) return n', {}));
});

test('a spec without params matches whatever params are passed', (t) => {
  const spec: QuerySpec = { query: 'RETURN 1', output: out('a') };
  t.is(matchQuerySet([spec], 'RETURN 1', { anything: [1, 2] }), spec.output);
  t.is(matchQuerySet([spec], 'RETURN 1', undefined), spec.output);
});

test('specs are searched in order; the first whose params match wins', (t) => {
  const first: QuerySpec = { query: 'RETURN $x', params: { x: 1 }, output: out('one') };
  const second: QuerySpec = { query: 'RETURN $x', params: { x: 2 }, output: out('two') };
  const catchAll: QuerySpec = { query: 'RETURN $x', output: out('any') };
  const set = [first, second, catchAll];
  t.is(matchQuerySet(set, 'RETURN $x', { x: 1 }), first.output);
  t.is(matchQuerySet(set, 'RETURN $x', { x: 2 }), second.output);
  t.is(matchQuerySet(set, 'RETURN $x', { x: 3 }), catchAll.output);
});

test('actual params may carry extra keys (subset match)', (t) => {
  const spec: QuerySpec = { query: 'RETURN $x', params: { x: 1 }, output: out('a') };
  t.is(matchQuerySet([spec], 'RETURN $x', { x: 1, y: 'extra' }), spec.output);
});

test('a missing expected key is a params mismatch with the "matched query" message', (t) => {
  const spec: QuerySpec = { query: 'RETURN $x', params: { x: 1 }, output: out('a') };
  const error = t.throws(() => matchQuerySet([spec], 'RETURN $x', { y: 1 }));
  t.regex(error.message, /your query was matched in your QuerySpec/);
  t.regex(error.message, /RETURN \$x/);
  t.regex(error.message, /"y":1/);
});

test('an unknown query reports the query and params', (t) => {
  const spec: QuerySpec = { query: 'RETURN 1', output: out('a') };
  const error = t.throws(() => matchQuerySet([spec], 'RETURN 2', { p: 'q' }));
  t.regex(error.message, /does not contain the given query/);
  t.regex(error.message, /RETURN 2/);
  t.regex(error.message, /"p":"q"/);
});

test('params longer than 1500 characters are truncated in the message', (t) => {
  const spec: QuerySpec = { query: 'RETURN 1', output: out('a') };
  const error = t.throws(() => matchQuerySet([spec], 'RETURN 2', { big: 'x'.repeat(2000) }));
  t.regex(error.message, /\.\.\./);
  t.true(error.message.length < 1800);
});

test('an empty query set never matches', (t) => {
  t.throws(() => matchQuerySet([], 'RETURN 1', {}), { message: /does not contain/ });
});

test('nested params match as a deep subset', (t) => {
  const spec: QuerySpec = { query: 'Q', params: { input: { name: 'a' } }, output: out('a') };
  t.is(matchQuerySet([spec], 'Q', { input: { name: 'a', age: 3 } }), spec.output);
  t.throws(() => matchQuerySet([spec], 'Q', { input: { name: 'b' } }));
});
