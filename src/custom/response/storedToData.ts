import { StoredResponse } from '../types/StoredResponse';
import { storedRecordsToData } from '../recordConversion/array/storedRecordsToData';

export function storedToData(storedResponse: StoredResponse): object[] {
    const {records} = storedResponse
    return storedRecordsToData(records)
}
