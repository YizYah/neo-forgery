import { StoredRecord } from '../..';
import { dataObjectToStoredRecord } from './dataObjectToStoredRecord';

export function dataToStoredRecords(dataRecords: object[]): StoredRecord[] {
    return dataRecords.map(dataRecord => dataObjectToStoredRecord(dataRecord))
}
