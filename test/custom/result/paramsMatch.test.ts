import test from 'ava';
import { paramsMatch } from '../../../src/custom/result/paramsMatch';
import { anyValue } from '../../../src';

test('empty expected params match anything, including undefined', (t) => {
  t.true(paramsMatch({ a: 1 }, {}));
  t.true(paramsMatch(undefined, {}));
});

test('equal values match; different values do not', (t) => {
  t.true(paramsMatch({ a: 1, b: 'x' }, { a: 1, b: 'x' }));
  t.false(paramsMatch({ a: 1 }, { a: 2 }));
});

test('actual may be a superset of expected', (t) => {
  t.true(paramsMatch({ a: 1, extra: true }, { a: 1 }));
});

test('arrays must match exactly in order', (t) => {
  t.true(paramsMatch({ ids: [1, 2] }, { ids: [1, 2] }));
  t.false(paramsMatch({ ids: [2, 1] }, { ids: [1, 2] }));
});

test('anyValue and predicates can be mixed with concrete values', (t) => {
  const expected = {
    id: anyValue,
    age: (actual: any) => actual > 18,
    name: 'Alice',
  };
  t.true(paramsMatch({ id: 'whatever', age: 30, name: 'Alice' }, expected));
  t.false(paramsMatch({ id: 'whatever', age: 10, name: 'Alice' }, expected));
  t.false(paramsMatch({ id: 'whatever', age: 30, name: 'Bob' }, expected));
});

test('a predicate receives undefined when the key is absent or params are undefined', (t) => {
  const seen: any[] = [];
  const expected = { k: (actual: any) => { seen.push(actual); return true; } };
  t.true(paramsMatch({}, expected));
  t.true(paramsMatch(undefined, expected));
  t.deepEqual(seen, [undefined, undefined]);
});

test('anyValue accepts an absent key', (t) => {
  t.true(paramsMatch({}, { k: anyValue }));
});

test('a predicate returning a falsy non-boolean counts as a mismatch', (t) => {
  t.false(paramsMatch({ k: 1 }, { k: () => 0 }));
  t.false(paramsMatch({ k: 1 }, { k: () => '' }));
});
