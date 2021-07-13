import test from 'ava';
import { storedResponse } from '../data/ResultSamples';
import { liveToStored } from '../../../src/custom/response/liveToStored';
import { storedToLive } from '../../../src/custom/response/storedToLive';

test('liveToStored', t => {
  const results = liveToStored(storedToLive(storedResponse));
  t.deepEqual(results, storedResponse);
});
