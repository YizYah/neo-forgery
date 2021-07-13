import test from 'ava';
import { dataResponse, storedResponse } from '../data/ResultSamples';
import { storedToData } from '../../../src/custom/response/storedToData';

test('storedToData', t => {
  const results = storedToData(storedResponse);
  t.deepEqual(results, dataResponse);
});
