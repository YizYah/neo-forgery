import test from 'ava';
import { dataResponse, storedResponse } from '../data/ResultSamples';
import { dataToStored } from '../../../src/custom/response/dataToStored';

test('dataToStored', t => {
  const results = dataToStored(dataResponse);
  t.deepEqual(results.records, storedResponse.records);
  t.deepEqual(results.summary, {});
});
