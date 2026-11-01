import test from 'ava';
import {
  mockResultsFromCapturedOutput,
  mockResultsFromData,
  dataToLive,
  MockOutput,
} from '../../src';
import { sampleRecordList } from './data/sampleRecordList';

// issue #47: MockOutput type alias and mockResultsFromCapturedOutput alias are exported.
test('MockOutput can be used as a StoredResponse', (t) => {
  const output: MockOutput = {
    records: [
      { keys: ['a'], length: 1, _fields: ['x'], _fieldLookup: { a: 0 } },
    ],
  };
  t.is(output.records.length, 1);
});

test('mockResultsFromData aliases dataToLive', (t) => {
  t.is(mockResultsFromData, dataToLive);
  t.deepEqual(mockResultsFromData(sampleRecordList), dataToLive(sampleRecordList));
});

test('mockResultsFromCapturedOutput is a working alias', (t) => {
  t.is(mockResultsFromCapturedOutput, mockResultsFromData);
  const live = mockResultsFromCapturedOutput(sampleRecordList);
  t.is(live.records[0].get('firstName'), 'clark');
});
