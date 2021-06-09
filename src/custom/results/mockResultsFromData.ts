import Result from "neo4j-driver/types/result";

// const Result = require('neo4j-driver').types.Result ;
import {ReturnedDataRecord} from "../records/ReturnedDataRecord";
import {instanciateRecordList} from "../records/instanciateRecordList";

export function mockResultsFromData(sampleResults: ReturnedDataRecord[]) {
    const records = instanciateRecordList(sampleResults)
    return {
        records,
        resultsSummary: {}
    }
}
