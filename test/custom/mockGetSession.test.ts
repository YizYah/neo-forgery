import test from 'ava';
import { mockGetSession } from '../../src';
import { QuerySpec } from '../../src/custom/types/QuerySpec';

// issue #37: mockGetSession returns a ready-to-use mock session from a query set.
const query = 'RETURN 1 AS n';
const querySet: QuerySpec[] = [
  {
    query,
    output: {
      records: [
        { keys: ['n'], length: 1, _fields: [{ low: 1, high: 0 }], _fieldLookup: { n: 0 } },
      ],
    },
  },
];

test('mockGetSession returns a working session', async (t) => {
  const session = mockGetSession(querySet);
  const result = await session.run(query, {});
  t.is(result.records[0].get('n').toNumber(), 1);
});
