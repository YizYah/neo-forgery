import test from 'ava'
import {mockResultsFromCapturedOutput} from "../../src/custom/results/mockResultsFromCapturedOutput";
import {sampleResult} from "./data/sampleResult";

test('mockQueryResults', t => {
    const results = mockResultsFromCapturedOutput(sampleResult)
    t.is(results.records[0].get('nodes')['foo'], 'bar')
})
