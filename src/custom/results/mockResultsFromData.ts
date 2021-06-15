import {instanciateRecordList} from "../records/instanciateRecordList";

export function mockResultsFromData(sampleResults: object[]) {
    const records = instanciateRecordList(sampleResults)
    return {
        records,
        resultsSummary: {}
    }
}
