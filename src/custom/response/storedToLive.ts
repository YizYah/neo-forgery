import { StoredResponse } from '../types/StoredResponse';
import { LiveResponse } from '../types/LiveResponse';
import { storedToData } from './storedToData';
import { dataToLive } from './dataToLive';

export function storedToLive(storedResponse: StoredResponse): LiveResponse {
    const data = storedToData(storedResponse)
    return dataToLive(data)
}