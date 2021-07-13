import { StoredRecord } from '../..';
import { neo4jIntStoredToData } from '../neo4jInts/neo4jIntStoredToData';
import traverse = require('traverse');

export function storedRecordToData(storedRecord: StoredRecord): object {
    const output: any = {}
    storedRecord.keys.map((key: string)=>{
        const fieldLookup = storedRecord._fieldLookup[key]
        const { _fields } = storedRecord
        const values = _fields.map(value=> traverse(value).map(neo4jIntStoredToData))
        output[key]= values[fieldLookup]
    })
    return output
}
