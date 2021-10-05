import { StoredResponse } from '../types/StoredResponse';
import { LiveResponse } from '../types/LiveResponse';
import { storedToData } from './storedToData';
import { dataToLive } from './dataToLive';

export function storedToLive(storedResponse: StoredResponse): LiveResponse {
    const data = storedToData(storedResponse)
    const returned = dataToLive(data)
    
    returned.summary = {...storedResponse.summary}
    if (!returned.hasOwnProperty('summary')) {
        returned.summary = {}
    }

    if (!returned.summary.hasOwnProperty('counters')) {
        returned.summary.counters = {
        }
    }

    returned.summary.counters.updates = () => null

    return returned

}
