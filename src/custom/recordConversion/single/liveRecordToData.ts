import { Record } from 'neo4j-driver';
import { storedRecordToData } from './storedRecordToData';
import { liveRecordToStored } from './liveRecordToStored';

export function liveRecordToData(liveRecord: Record): object {
    return storedRecordToData(liveRecordToStored(liveRecord))
}
