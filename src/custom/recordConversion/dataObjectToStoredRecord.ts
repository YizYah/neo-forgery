import { StoredRecord } from '../types/StoredRecord';
import traverse = require('traverse');
import { neo4jIntDataToStored } from '../neo4jInts/neo4jIntDataToStored';

export function dataObjectToStoredRecord(dataObject: any): StoredRecord {
    const keys = Object.keys(dataObject)
    const length = keys.length
    const values: object[] = Object.values(dataObject)
    const _fields = traverse(values).map(neo4jIntDataToStored)
    const _fieldLookup: any = {}
    keys.map((key:string, index:number)=> {
        _fieldLookup[key] = index
    })

    return {
        _fields,
        keys,
        _fieldLookup,
        length,
    }
}
