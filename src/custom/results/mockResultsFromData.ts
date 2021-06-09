import {ReturnedDataRecord} from "../types/ReturnedDataRecord";
import {instanciateRecordList} from "../records/instanciateRecordList";

export function mockResultsFromData(sampleResults: ReturnedDataRecord[]) {
    const records = instanciateRecordList(sampleResults)
    return {
        records,
        resultsSummary: {}
    }
}
