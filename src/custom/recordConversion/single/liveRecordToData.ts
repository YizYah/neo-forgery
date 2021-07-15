import { Record } from 'neo4j-driver-core';
import { storedRecordToData } from './storedRecordToData';
import { liveRecordToStored } from './liveRecordToStored';

export function liveRecordToData(liveRecord: Record): object {
    return storedRecordToData(liveRecordToStored(liveRecord))
}
