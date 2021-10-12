import test from 'ava';
import { storedResponse, storedResponseNoSummary } from '../data/ResultSamples';
import { storedToLive } from '../../../src/custom/response/storedToLive';

test('storedToLive', t => {

    const results = storedToLive(storedResponse)
    t.deepEqual(results.summary, storedResponse.summary)
    t.is(results.records[0].get('app').properties.value, 'value1')
    t.is(results.records[1].get('app').properties.id, 'id2')

    // this tests the conversion of the neo4j int
    t.is(results.records[1].get('app').identity.low, 4497)
    t.is(results.records[1].get('app').identity.high, 0)
    t.notDeepEqual(results.records[1].get('app').identity, storedResponse.records[1]._fields[0].identity)
})


test('storedToLive with no summary', t => {
    const results = storedToLive(storedResponseNoSummary)

    // this tests the conversion of the neo4j int
    t.is(typeof results.summary.counters.updates, 'function')
})
