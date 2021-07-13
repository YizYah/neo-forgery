import { dataToLiveRecords } from '../recordConversion/dataToLiveRecords';
import { LiveResponse } from '../types/LiveResponse';

export function dataToLive(data: object[]): LiveResponse {
    const records = dataToLiveRecords(data)

    return {
        records,
        summary: {}
    }
}
