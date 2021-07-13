import { StoredResponse } from '../types/StoredResponse';
import { dataToStoredRecords } from '../recordConversion/dataToStoredRecords';

export function dataToStored(data: object[]): StoredResponse {
    const records = dataToStoredRecords(data)

    return {
        records,
        summary: {}
    }
}
