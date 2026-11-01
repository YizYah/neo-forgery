import test from 'ava';
import { mockSessionFromQuerySet, anyValue } from '../../src';
import { QuerySpec } from '../../src/custom/types/QuerySpec';

const query = 'MATCH (p:Person {id: $id}) RETURN p';
const output = {
  records: [
    { keys: ['p'], length: 1, _fields: ['matched'], _fieldLookup: { p: 0 } },
  ],
};

// issue #43: a predicate param value
test('predicate param value matches when it returns true', async (t) => {
  const querySet: QuerySpec[] = [
    { query, params: { id: (actual: any) => typeof actual === 'string' }, output },
  ];
  const session = mockSessionFromQuerySet(querySet);
  const result = await session.run(query, { id: 'abc' });
  t.is(result.records[0].get('p'), 'matched');
});

test('predicate param value rejects when it returns false', async (t) => {
  const querySet: QuerySpec[] = [
    { query, params: { id: (actual: any) => typeof actual === 'number' }, output },
  ];
  const session = mockSessionFromQuerySet(querySet);
  const error = await t.throwsAsync(() => session.run(query, { id: 'abc' }) as any);
  t.regex((error as Error).message, /your params were not matched/);
});

// issue #43: the anyValue wildcard
test('anyValue skips the key whatever the actual value is', async (t) => {
  const querySet: QuerySpec[] = [{ query, params: { id: anyValue }, output }];
  const session = mockSessionFromQuerySet(querySet);

  const first = await session.run(query, { id: 'anything' });
  t.is(first.records[0].get('p'), 'matched');

  const second = await session.run(query, { id: 42 });
  t.is(second.records[0].get('p'), 'matched');
});
