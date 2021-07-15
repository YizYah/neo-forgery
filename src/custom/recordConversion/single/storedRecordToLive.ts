import {StoredRecord} from "../../types/StoredRecord";
// const Record = require('neo4j-driver').types.Record ;
import { Record } from 'neo4j-driver-core';

export function storedRecordToLive(storedRecord: StoredRecord): Record<any, any> {
    return new Record(
        storedRecord.keys,
        storedRecord._fields,
        storedRecord._fieldLookup,
    )
}
