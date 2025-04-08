import test from 'ava'
import { mockSessionFromFunction } from "../../src/custom/session/mockSessionFromFunction"
// import { mockSessionFromFunction} from "../../src/custom/session/mockSessionFromFunction"
import { sampleRecordList } from "./data/sampleRecordList";
import { dataToLive } from "../../src/custom/response/dataToLive";
import { Result, Transaction, int } from 'neo4j-driver';

const sessionRunMock = (query: string, parameters?: any): Result => {
    return dataToLive(sampleRecordList) as unknown as Result;
};

test('mockSessionFromFunction', t => {
    const session = mockSessionFromFunction(sessionRunMock)
    t.is(session.run, sessionRunMock)
})

test('mockSessionFromFunction works with transacation', async t => {
    const session = mockSessionFromFunction(sessionRunMock)

    const output: any = await session.writeTransaction((tx: Transaction) =>
        tx.run('', { foo: "bar" }))

    t.is(output.summary.transactionType, 'WRITE')
})


test('mockSessionFromFunction with transacation', async t => {
    const session = mockSessionFromFunction(sessionRunMock)
    const tx = session._beginTransaction('READ', { 
        timeout: int(1000),
        metadata: {},
        isEmpty: () => false
    })
    // t.is(tx.run, sessionRunMock)
    t.is(tx.isOpen(), true)
    t.is(await tx.rollback(), await Promise.resolve())
    t.is(await tx.commit(), await Promise.resolve())
    t.is(await tx.commit(), await Promise.resolve())
    t.is(tx.isOpen(), false)
})

