import {ReturnedDataRecord} from "../records/ReturnedDataRecord";
import {instanciateRecordList} from "../records/instanciateRecordList";

export function mockResultsFromData(sampleResults: ReturnedDataRecord[]) {
    const records = instanciateRecordList(sampleResults)
    return {
        records,
        resultsSummary: {}
    }
}
