import { StoredRecord } from '../../types/StoredRecord';
import { Record } from 'neo4j-driver';

export function liveRecordToStored(liveRecord: Record): StoredRecord {
    return JSON.parse(JSON.stringify(liveRecord))
}
