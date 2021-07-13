import { Record } from 'neo4j-driver-core';
import { liveRecordToData } from './liveRecordToData';

export function liveRecordsToData(records: Record[]): object[] {
    return records.map(record => liveRecordToData(record))
}
