import test from 'ava';
import { storedResponse } from '../data/ResultSamples';
import { liveToStored } from '../../../src/custom/response/liveToStored';
import { storedToLive } from '../../../src/custom/response/storedToLive';
import { stripUpdates } from '../data/stripUpdates';

test('liveToStored', t => {
  // const expected: any  = {...storedResponse}
  // expected.summary.counters.updates = ()=>{}
  const results = liveToStored(storedToLive(storedResponse));

  t.like(results, stripUpdates(storedResponse));
});
