import test from 'ava'
const mockSession = require("../../src/custom/session/mockSession")
import {sampleRecordList} from "./data/sampleRecordList";
import {mockResultsFromData} from "../../../../export-server-all/export-server/test/custom/neoforgery/results/mockResultsFromData";

const sessionRunMock = (query: string, params: any) => {
    return mockResultsFromData(sampleRecordList);
};

test('mockSession', t => {
    const session = mockSession(sessionRunMock)
    t.is(session.run, sessionRunMock)
    t.not(session.run, ()=>{return 1})
})
