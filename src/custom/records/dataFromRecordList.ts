import {dataFromRecord} from "./dataFromRecord";
// const Record = require('neo4j-driver').types.Record ;

export function dataFromRecordList(records: Record<any, any>[]): object[] {
    return records.map(record => dataFromRecord(record))
}
