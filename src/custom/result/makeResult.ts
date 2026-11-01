import { Result } from 'neo4j-driver';
import { StoredResponse } from '../types/StoredResponse';
import { storedToData } from '../response/storedToData';
import { dataToLive } from '../response/dataToLive';

// Translates a stored summary (the shape captured from a live neo4j-driver 4.x result)
// into the `metadata` object that the driver's `Result`/`ResultSummary` expect.
// The driver constructs the real `ResultSummary` itself from this metadata, which is
// why `counters.updates()` / `containsUpdates()` work without any hand-made shim.
function buildMetadata(storedSummary?: any): any {
  if (!storedSummary) return {};

  const stats =
    (storedSummary.counters && storedSummary.counters._stats) ||
    (storedSummary.updateStatistics && storedSummary.updateStatistics._stats) ||
    storedSummary.stats ||
    {};

  const metadata: any = {
    type: storedSummary.queryType ?? storedSummary.type,
    stats,
    result_consumed_after:
      storedSummary.resultConsumedAfter ?? storedSummary.result_consumed_after,
    result_available_after:
      storedSummary.resultAvailableAfter ?? storedSummary.result_available_after,
  };

  if (storedSummary.server) metadata.server = storedSummary.server;
  if (storedSummary.database && storedSummary.database.name) {
    metadata.db = storedSummary.database.name;
  } else if (storedSummary.db) {
    metadata.db = storedSummary.db;
  }
  // Only forward a plan/profile when one is actually present. The driver treats any
  // non-null value as "a plan exists", so a stored `plan: false` must be omitted.
  if (storedSummary.plan) metadata.plan = storedSummary.plan;
  if (storedSummary.profile) metadata.profile = storedSummary.profile;

  return metadata;
}

// A minimal, duck-typed `ResultStreamObserver`. The driver's `Result` subscribes real
// observers to it; we replay the stored records and metadata synchronously.
function fakeObserver(replay: (observer: any) => void): any {
  return {
    subscribe: replay,
    cancel() {
      /* no-op */
    },
    pause() {
      /* no-op */
    },
    resume() {
      /* no-op */
    },
    prepareToHandleSingleResponse() {
      /* no-op */
    },
    markCompleted() {
      /* no-op */
    },
  };
}

// Builds a real neo4j-driver `Result` from a stored response, so every consumption style
// (`await`, `.records`, `.keys()`, `for await`, `.summary()`, `.subscribe()`, `.as()`) works.
export function makeResult(
  query: string,
  params: any,
  storedResponse: StoredResponse,
): Result {
  const { records } = dataToLive(storedToData(storedResponse));
  const keys =
    storedResponse.records && storedResponse.records.length > 0
      ? storedResponse.records[0].keys
      : [];
  const metadata = buildMetadata(storedResponse.summary);

  const observer = fakeObserver((o: any) => {
    if (o.onKeys) o.onKeys(keys);
    records.forEach((record) => {
      if (o.onNext) o.onNext(record);
    });
    if (o.onCompleted) o.onCompleted(metadata);
  });

  return new Result(Promise.resolve(observer), query, params);
}

// Builds a real `Result` that fails: `await` rejects, `for await` throws, and
// `subscribe` calls `onError` — all with the same error object.
export function makeErrorResult(query: string, params: any, error: Error): Result {
  const observer = fakeObserver((o: any) => {
    if (o.onError) o.onError(error);
  });

  return new Result(Promise.resolve(observer), query, params);
}
