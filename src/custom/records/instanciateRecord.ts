import {ReturnedDataRecord} from "./ReturnedDataRecord";
const Record = require('neo4j-driver').types.Record ;

export function instanciateRecord(returnedDataRecord: ReturnedDataRecord): Record<any, any> {
    const keys = Object.keys(returnedDataRecord)
    const values = Object.values(returnedDataRecord)
    const fieldLookup: any = {}
    keys.map((key:string, index:number)=> {
        fieldLookup[key] = index
    })

    return new Record(keys, values, fieldLookup)
}
