import { StoredResponse } from '../types/StoredResponse';
import { LiveResponse } from '../types/LiveResponse';

export function liveToStored(liveResponse: LiveResponse): StoredResponse {
    const returned = JSON.parse(JSON.stringify(liveResponse))
    return returned
}
