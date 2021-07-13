import { LiveResponse } from '../types/LiveResponse';
import { liveRecordsToData } from '../recordConversion/liveRecordsToData';

export function liveToData(liveResponse: LiveResponse): object[] {
    const {records} = liveResponse
    return liveRecordsToData(records)
}
