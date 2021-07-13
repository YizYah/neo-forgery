import test from 'ava';
import { dataResponse, storedResponse } from '../data/ResultSamples';
import { liveToData } from '../../../src/custom/response/liveToData';
import { storedToLive } from '../../../src/custom/response/storedToLive';

test('liveToData', t => {
  const liveResponse = storedToLive(storedResponse)
  const results = liveToData(liveResponse);
  t.deepEqual(results, dataResponse);
});
