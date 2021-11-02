import { StoredResponse } from '../types/StoredResponse';
import { LiveResponse } from '../types/LiveResponse';
import { storedToData } from './storedToData';
import { dataToLive } from './dataToLive';

// @neo4j/graphql in version 2 started to set statistics to
// result.summary.counters.updates().  What that apparently does is update result.summary.updateStatistics._stats
// it may also update result.summary.counter._stats, but so far they do not seem to be accessing that.
// so the code below must grab whatever is stored there and update it.

export function storedToLive(storedResponse: StoredResponse): LiveResponse {
    const data = storedToData(storedResponse)
    const returned = dataToLive(data)
    returned.summary = {...storedResponse.summary}
    let updateStatistics:any = {}

    if (storedResponse.summary) updateStatistics = { ...storedResponse.summary.updateStatistics }

    if (!returned.summary.hasOwnProperty('counters')) {
        returned.summary.counters = {
        }
    }

    returned.summary.counters.updates = () =>  updateStatistics._stats

    return returned

}
