import { dataToLiveRecords } from '../recordConversion/array/dataToLiveRecords';
import { LiveResponse } from '../types/LiveResponse';

export function dataToLive(data: object[]): LiveResponse {
    const records = dataToLiveRecords(data)

    return {
        records,
        summary: {}
    }
}

// Documented aliases of `dataToLive` (issue #47). `mockResultsFromCapturedOutput` is the
// name used in the Neo4j blog tutorial; `mockResultsFromData` is the alias wired through
// `index.ts`.
export const mockResultsFromData = dataToLive
export const mockResultsFromCapturedOutput = mockResultsFromData
