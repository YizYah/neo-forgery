import { LiveResponse } from '../types/LiveResponse';
import { liveRecordsToData } from '../recordConversion/array/liveRecordsToData';

export function liveToData(liveResponse: LiveResponse): object[] {
    const {records} = liveResponse
    return liveRecordsToData(records)
}
