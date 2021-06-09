import {SampleOutputRecord} from "../types/ReturnedDataRecord";
const Record = require('neo4j-driver').types.Record ;

export function instanciateRecordFromSampleOutput(sampleOutputRecord: SampleOutputRecord): Record<any, any> {
    return new Record(
        sampleOutputRecord.keys,
        sampleOutputRecord._fields,
        sampleOutputRecord._fieldLookup,
    )
}
