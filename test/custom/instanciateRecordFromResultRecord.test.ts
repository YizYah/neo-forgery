import test from 'ava'
import {instanciateRecordFromSampleOutput} from "../../src/custom/records/instanciateRecordFromSampleOutput";
const {sampleResult} = require('./data/sampleResult')
// import { Record } from 'neo4j-driver';

const {records} = sampleResult;
const sampleRecord = records[0]

test('instanciateRecord', t => {
    const record = instanciateRecordFromSampleOutput(sampleRecord)
    t.is(record.get('nodes').foo, 'bar')

})
