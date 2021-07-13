import traverse = require('traverse');
import { Record } from 'neo4j-driver-core';
import { neo4jIntDataToLive } from '../neo4jInts/neo4jIntDataToLive';

export function dataObjectToLiveRecord(dataObject: object): Record {
    const keys = Object.keys(dataObject)
    const rawValues = Object.values(dataObject)
    const values = traverse(rawValues).map(neo4jIntDataToLive)
    const fieldLookup: any = {}
    keys.map((key:string, index:number)=> {
        fieldLookup[key] = index
    })

    return new Record(keys, values, fieldLookup)
}
