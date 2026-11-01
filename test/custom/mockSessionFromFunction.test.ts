import test from 'ava'
import { mockSessionFromFunction } from '../../src'
import { sampleRecordList } from "./data/sampleRecordList";
import { dataToLive } from "../../src/custom/response/dataToLive";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sessionRunMock = (query: string, params: any) => {
    return dataToLive(sampleRecordList);
};

test('mockSessionFromFunction run delegates to the supplied function', t => {
    const session = mockSessionFromFunction(sessionRunMock)
    const output: any = session.run('anything', {})
    t.deepEqual(output, dataToLive(sampleRecordList))
})

test('mockSessionFromFunction works with transaction', async t => {
    const session = mockSessionFromFunction(sessionRunMock)

    const output: any = await (session as any).writeTransaction((tx: any) =>
        tx.run('', { foo: "bar" }))

    t.is(output.summary.transactionType, 'WRITE')
})


test('mockSessionFromFunction explicit transaction lifecycle', async t => {
    const session = mockSessionFromFunction(sessionRunMock)
    const tx = session.beginTransaction()
    t.is(tx.isOpen(), true)
    t.is(await tx.rollback(), await Promise.resolve())
    t.is(await tx.commit(), await Promise.resolve())
    t.is(await tx.commit(), await Promise.resolve())
    t.is(tx.isOpen(), false)
})
