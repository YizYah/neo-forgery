export function stripUpdates(result: any): any {
  if (result.summary &&
    result.summary.counters &&
    result.summary.counters.updates) {
    const returned = { ...result };
    delete returned.summary.counters.updates;
    return returned;
  }
  return result;
}
