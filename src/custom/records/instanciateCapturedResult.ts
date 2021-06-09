import {SampleOutputRecord} from "./ReturnedDataRecord";
import {instanciateRecordFromSampleOutput} from "./instanciateRecordFromSampleOutput";

const Record = require('neo4j-driver').types.Record ;

export function instanciateCapturedResult(capturedResult: any): Record<any, any>[] {
    const {records} = capturedResult
    return records.map((returnedDataRecord: SampleOutputRecord) =>
        instanciateRecordFromSampleOutput(returnedDataRecord)
    )
}
