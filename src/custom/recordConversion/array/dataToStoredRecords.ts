import { StoredRecord } from '../../../index';
import { dataObjectToStoredRecord } from '../single/dataObjectToStoredRecord';

export function dataToStoredRecords(dataRecords: object[]): StoredRecord[] {
    return dataRecords.map(dataRecord => dataObjectToStoredRecord(dataRecord))
}
