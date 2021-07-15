import {dataObjectToLiveRecord} from "../single/dataObjectToLiveRecord";
import { Record } from 'neo4j-driver-core';

// const Record = require('neo4j-driver').types.Record ;

export function dataToLiveRecords(returnedDataRecords: object[]): Record[] {
    return returnedDataRecords.map(returnedDataRecord => dataObjectToLiveRecord(returnedDataRecord))
}
