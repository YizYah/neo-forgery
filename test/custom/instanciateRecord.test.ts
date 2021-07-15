import test from 'ava'
import {dataObjectToLiveRecord} from "../../src/custom/recordConversion/single/dataObjectToLiveRecord";

// import { Record } from 'neo4j-driver';

const sampleRecord = {
    'userClass': 'customer',
    'firstName': 'clark',
    'lastName': 'candia',
    'id': '1c34b1f0-91c8-4bf8-9ce3-6dbfad72e0d5',
    'email': 'clarkcandia@outlook.com',
    'value': 'kurakudesuu',
};


test('instanciateRecord', t => {
    const record = dataObjectToLiveRecord(sampleRecord)
    t.is(record.get('value'), 'kurakudesuu')

})
