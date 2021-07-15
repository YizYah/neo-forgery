import test from 'ava'
import {storedRecordToLive} from "../../src/custom/recordConversion/single/storedRecordToLive";
const {sampleResult} = require('./data/sampleResult')
// import { Record } from 'neo4j-driver';

const {records} = sampleResult;
const sampleRecord = records[0]

test('instanciateRecord', t => {
    const record = storedRecordToLive(sampleRecord)
    t.is(record.get('nodes').foo, 'bar')

})
