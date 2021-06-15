import {instanciateRecord} from "./instanciateRecord";

// const Record = require('neo4j-driver').types.Record ;

export function instanciateRecordList(returnedDataRecords: object[]): Record<any, any>[] {
    return returnedDataRecords.map(returnedDataRecord => instanciateRecord(returnedDataRecord))
}
