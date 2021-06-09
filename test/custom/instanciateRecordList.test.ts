import test from 'ava'
import {instanciateRecordList} from "../../src/custom/records/instanciateRecordList";
import {sampleRecordList} from "./data/sampleRecordList";

test('instanciateRecord', t => {
    const record = instanciateRecordList(sampleRecordList)
    t.is(record[0].get('value'), 'kurakudesuu')
    t.is(record[1].get('id'), 'bd131c97-0fbe-4b2c-9e17-8ad0303abd78')
})
