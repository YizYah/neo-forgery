import test from 'ava';
import { storedResponse } from '../data/ResultSamples';
import { wrapCopiedResults } from '../../../src/custom/response/wrapCopiedResults';

test('wrapCopiedResults', t => {
    const {records, summary} = storedResponse
    const results = wrapCopiedResults(records, summary)
    t.deepEqual(results, storedResponse)
})

test('wrapCopiedResults without summary', t => {
    const {records, summary} = storedResponse
    const results = wrapCopiedResults(records)
    t.deepEqual(results.records, storedResponse.records)
    t.deepEqual(results.summary, {})
})
