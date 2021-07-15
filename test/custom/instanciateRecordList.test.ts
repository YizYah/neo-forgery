import test from 'ava'
import {dataToLiveRecords} from "../../src/custom/recordConversion/array/dataToLiveRecords";
import {sampleRecordList} from "./data/sampleRecordList";

test('data to records', t => {
    const record = dataToLiveRecords(sampleRecordList)
    t.is(record[0].get('value'), 'kurakudesuu')
    t.is(record[1].get('id'), 'bd131c97-0fbe-4b2c-9e17-8ad0303abd78')
})
