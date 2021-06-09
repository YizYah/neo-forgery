import test from 'ava'
import {instanciateCapturedResult} from "../../src/custom/records/instanciateCapturedResult";
import {sampleResult} from "./data/sampleResult";

test('instanciateRecord', t => {
    const records = instanciateCapturedResult(sampleResult)
    t.is(records[0].get('nodes')['foo'], 'bar')
})
