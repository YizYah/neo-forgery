import { StoredRecord } from '../../types/StoredRecord';
import { Record } from 'neo4j-driver-core';

export function liveRecordToStored(liveRecord: Record): StoredRecord {
    return JSON.parse(JSON.stringify(liveRecord))
}
