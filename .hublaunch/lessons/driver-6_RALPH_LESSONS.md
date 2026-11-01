# HubLaunch Lessons Learned

## Current Status: ✅ COMPLETE (committed d4a3e47 on branch driver-6)
- lint 0, build 0, `npm test` = 65 passed exit 0 (driver 6.3.0). Smoke-tested core on driver 5.28.1 (only driver-6-only `.as()` test is N/A there).
- Committed as `feat!:` with BREAKING CHANGE footer + dnorton credit. Pre-commit hook (npm test) passed.
- IMPORTANT fix for whole-suite run: default ava concurrency starved ts-node → set `concurrency: 4`, `timeout: 60s` in package.json ava config.
- GitHub-mechanics items from plan NOT performable in container (cherry-pick dnorton's fork, post thank-you on #48, two separate releases). dnorton credited in README + commit instead. Single branch holds the full redesign.

## Earlier phase notes
- Phase: Implementing Release 2 redesign (core)
- Node v20.20.2; network works (npm install OK). neo4j-driver 6.3.0 installs fine.

## Key Discoveries (driver 6 internals — VERIFIED by prototype)
- `new Result(Promise.resolve(observer), query, params)` works; `instanceof Result` true.
- Driver builds the `ResultSummary` ITSELF from the **metadata** my observer passes to `onCompleted(metadata)`. I do NOT pass a ResultSummary; I pass raw metadata.
  - metadata keys the driver reads: `type`, `stats` (flat {nodesCreated,...}), `server`, `result_consumed_after`, `result_available_after`, `db`, `plan`, `profile`.
  - WARNING: metadata.plan/profile are only skipped when `== null`. Stored summaries have `plan:false` → must OMIT (not pass false), else `new Plan(false)` runs.
- `.summary()` subscribes an observer WITHOUT `onNext`. So my fake observer MUST guard: `if (o.onNext) o.onNext(rec)` etc.
- fake observer needs: subscribe(o), cancel, pause, resume, prepareToHandleSingleResponse, markCompleted (all no-op except subscribe).
- `QueryStatistics(stats)` → `updates()` returns `_stats`; `containsUpdates()` sums stats. Stored format has `counters._stats` and `updateStatistics._stats` — map `stats = counters._stats || updateStatistics._stats`.
- `transactionType`: driver builds its own summary, so can't inject via metadata. Instead stamp in `executeRead`/`executeWrite` AFTER `await work(tx)` (result = {records, summary}; set result.summary.transactionType). Explicit-tx transactionType is NOT tested, so not needed there.

## Design
- `MockSession`/`MockTransaction` share a "runner" fn `(query,params)=>Result|any`.
  - query-set runner = matcher → makeResult (real Result). function mode: runner = user fn directly.
- executeRead/Write: `const tx=new MockTransaction(runner,type); const r=await work(tx); stamp(r,type); return r;`
- Record class: switch src imports `neo4j-driver-core` → `neo4j-driver`.

## Tests needing rewrite (monkeypatch asserts)
- mockSessionFromFunction.test.ts:13 (`session.run===fn`), :29 (`_beginTransaction()`)
- mockDriver.test.ts:8 (`result.session.toString`)
- server.test.ts (apollo-server 2 + @neo4j/graphql 2 → graphql-js + @neo4j/graphql 7)
- mockSessionFromQuerySet.test.ts deepEqual against storedToLive summary → adapt to compare records

## Out of reach in container (note in PR/lessons, cannot perform)
- Cherry-picking dnorton's fork commits / posting thank-you on GH issue #48 / two separate releases. Doing single branch with full redesign.

## @neo4j/graphql 7 integration (VERIFIED)
- contextValue uses `{ executionContext: driver }` (not `driver`).
- typeDefs need `@node` directive on node types.
- v7 probes `CYPHER 5\nCALL dbms.components() ... RETURN version, edition` before every op via `session.executeRead`.
- Reads use `session.executeRead`; mutations use `session.executeWrite`. Does NOT use driver.executeQuery.
- Filter syntax changed: `where: { title: { eq: 'x' } }` (StringScalarFilters fields: eq,in,contains,endsWith,startsWith).
- generated read Cypher: `CYPHER 5\nMATCH (this:Movie)\nRETURN this { .title } AS this` → record key `this`.
- generated delete Cypher: `CYPHER 5\nMATCH (this:Book)\nWHERE (this.title = $param0 AND this.author = $param1)\nDETACH DELETE this`.
- @neo4j/graphql needs REAL summary.counters (nodesDeleted etc) → must use mockSessionFromQuerySet (makeResult), NOT raw dataToLive (summary:{}).

## Status: core + all rewritten tests GREEN
- offline group green; server.test green; matcher/transaction/mockSession/mockDriver green.
- driverFromDatabaseInfo & getSession still pass against v6 internals (_meta.address._host, _database still exist).
- Record class switched src core→driver. Build (tsc) clean.

## Files Modified (src)
- package.json, src/index.ts, src/custom/result/{makeResult,matchQuerySet,paramsMatch}.ts (new)
- src/custom/transaction/MockTransaction.ts, src/custom/session/{MockSession,mockSessionFromQuerySet,mockSessionFromFunction,mockGetSession}.ts
- src/custom/driver/mockDriver.ts, src/custom/types/{QuerySpec,StoredResponse}.ts
- src/custom/neo4jInts/{neo4jIntStoredToLive,neo4jIntStoredToData}.ts, src/custom/response/{storedToLive,dataToLive}.ts
- record conversion files: core→driver import; storedRecordToLive fieldLookup cast as any

## Next Steps
- Add issue tests (#43/#44/#37) + consumption-style tests. Run lint. README + goals.md. Final full suite.
