import test from 'ava'
import {mockResultsFromData} from "../../src/custom/results/mockResultsFromData";
import {sampleRecordList} from "./data/sampleRecordList";

test('mockQueryResults', t => {
    const results = mockResultsFromData(sampleRecordList)
    t.is(results.records[0].get('value'), 'kurakudesuu')
    t.is(results.records[1].get('id'), 'bd131c97-0fbe-4b2c-9e17-8ad0303abd78')
})
