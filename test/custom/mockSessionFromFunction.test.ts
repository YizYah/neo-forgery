import test from 'ava'
const mockSessionFromFunction = require("../../src/custom/session/mockSessionFromFunction")
import {sampleRecordList} from "./data/sampleRecordList";
import {mockResultsFromData} from "../../src/custom/results/mockResultsFromData";

const sessionRunMock = (query: string, params: any) => {
    return mockResultsFromData(sampleRecordList);
};

test('mockSessionFromFunction', t => {
    const session = mockSessionFromFunction(sessionRunMock)
    t.is(session.run, sessionRunMock)
    t.not(session.run, ()=>{return 1})
})

test('mockSessionFromFunction with transacation', async t => {
    const session = mockSessionFromFunction(sessionRunMock)
    const tx = session._beginTransaction()
    t.is(tx.run, sessionRunMock)
    t.is(tx.isOpen(), true)
    t.is(await tx.rollback(), await Promise.resolve())
    t.is(await tx.commit(), await Promise.resolve())
    t.is(await tx.commit(), await Promise.resolve())
    t.is(tx.isOpen(), false)
})

