import test from 'ava';
// @ts-ignore
import { readQuery, readParams } from './data/queries/readQuery';
import { writeParams, writeQuery, writeQueryFlawed } from './data/queries/writeQuery';
import { querySet } from './data/helpers/querySet';
import { mockSessionFromQuerySet } from '../../src';

test('transactions are mocked', async (t) => {

  const session = mockSessionFromQuerySet(querySet);

  const writeResult = await session.writeTransaction((tx: any) =>
    tx.run(writeQuery, writeParams),
  );
  writeResult.records.forEach((record: any) => {
    const person1Node = record.get('p1');
    const person2Node = record.get('p2');

    t.is(person1Node.properties.name, 'Alice');
    t.is(person2Node.properties.name, 'David');
  });

  const readResult = await session.readTransaction((tx: any) =>
    tx.run(readQuery, readParams),
  );
  readResult.records.forEach((record: any) => {
    t.is(record.get('name'), 'Alice');
  });
});


test('transaction rollback', async (t) => {

  const session = mockSessionFromQuerySet(querySet);

  const error = await t.throwsAsync(async () => {
    await session.writeTransaction((tx: any) =>
      tx.run(writeQueryFlawed, writeParams));
  });

  t.regex(error.message, /the query set provided does not contain/);

});
