import {StoredRecord} from "../../types/StoredRecord";
// const Record = require('neo4j-driver').types.Record ;
import { Record, RecordShape } from 'neo4j-driver';

export function storedRecordToLive(storedRecord: StoredRecord): Record {
    const fieldLookup: RecordShape<string, number> = {};
    Object.keys(storedRecord._fieldLookup).forEach(key => {
        fieldLookup[key] = storedRecord._fieldLookup[key];
    });
    
    return new Record(
        storedRecord.keys,
        storedRecord._fields,
        fieldLookup
    );
}
