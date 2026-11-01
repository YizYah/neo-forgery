import { Record } from 'neo4j-driver';
import { liveRecordToData } from '../single/liveRecordToData';

export function liveRecordsToData(records: Record[]): object[] {
    return records.map(record => liveRecordToData(record))
}
