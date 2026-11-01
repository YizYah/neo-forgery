import { StoredResponse } from '../types/StoredResponse';
import { LiveResponse } from '../types/LiveResponse';
import { storedToData } from './storedToData';
import { dataToLive } from './dataToLive';

// Converts a stored response into live records plus the stored summary. The summary is now
// consumed by `makeResult`, which builds a real `ResultSummary` (with working
// `counters.updates()`/`containsUpdates()`), so no hand-made counter shim is needed here.
export function storedToLive(storedResponse: StoredResponse): LiveResponse {
    const data = storedToData(storedResponse)
    const returned = dataToLive(data)
    returned.summary = storedResponse.summary ? { ...storedResponse.summary } : {}

    return returned
}
