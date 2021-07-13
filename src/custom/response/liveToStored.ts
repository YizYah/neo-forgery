import { StoredResponse } from '../types/StoredResponse';
import { LiveResponse } from '../types/LiveResponse';

export function liveToStored(liveResponse: LiveResponse): StoredResponse {
    return JSON.parse(JSON.stringify(liveResponse))
}
