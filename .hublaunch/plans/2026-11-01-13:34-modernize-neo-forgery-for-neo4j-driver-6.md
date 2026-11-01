# Modernize neo-forgery for neo4j-driver 6.x (with 5.x support): real `Result`-based `MockDriver`/`MockSession`/`MockTransaction`

## Plan Summary
- **What/why:** neo-forgery currently mocks Neo4j by building a *real* `Session` from a *real* `Driver` pointed at a fake URI and monkeypatching the public `run` plus the **private** `_beginTransaction`. neo4j-driver 6.x removed `readTransaction`/`writeTransaction` (the reason the private hook existed), and the mock returns a plain `{records, summary}` instead of a real `Result`, so modern tooling (`@neo4j/graphql` 7, `for await`, `.summary()`, `.as()`, `driver.executeQuery()`) breaks. We replace the monkeypatch with small duck-typed classes that implement only the driver's **public** surface and return **real** `Result`/`ResultSummary`/`EagerResult` objects.
- **Key decision — two releases, one plan (Q1=B):** Release 1 is a **non-breaking minor** that lands community PR #48's neo4j-driver 5.28 bump with **dnorton's authorship preserved**; Release 2 is the **2.0 major** redesign (peer dependency `>=5 <7`, Node ≥18, real `Result`, removed private-hook behaviour).
- **Most important files:** `src/custom/session/mockSessionFromQuerySet.ts`, `src/custom/session/mockSessionFromFunction.ts`, `src/custom/driver/mockDriver.ts`, `src/custom/response/storedToLive.ts`, `src/index.ts`, `package.json`.
- **Backlog closed in Release 2:** #47 (`MockOutput` alias + `mockResultsFromCapturedOutput` alias), #44 (zero/negative lossless-integer detection), #43 (predicate param matchers + `anyValue` wildcard), #37 (`mockGetSession`). #40 stays open (neo-forte follow-up).
- **Priority/complexity:** High priority (package is stuck on driver 4.4), high complexity (public-surface re-implementation + real driver-object construction verified against 6.3.0), contained blast radius (test-only library; all 41 existing tests must still pass, adapted only where they assert the monkeypatch).

## Problem Statement

neo-forgery is a test-only library ("the easy way to mock a neo4j-driver session", `package.json:2`) that lets developers mock Neo4j calls from a captured/declared query set. It pins `neo4j-driver`/`neo4j-driver-core` at `^4.4.1` (`package.json` `dependencies`), while the driver is now 6.3.0 (5.28.x still maintained). The mocking mechanism is incompatible with driver 5/6 in three ways:

1. **Private-hook dependence.** `mockSessionFromQuerySet` / `mockSessionFromFunction` build a real `Driver`→`Session` from a fake URI (the driver is lazy and never connects), then assign `fakeSession.run = mockRun` and `fakeSession._beginTransaction = …` (`src/custom/session/mockSessionFromQuerySet.ts:40-98`, `src/custom/session/mockSessionFromFunction.ts:12-46`). In 4.4, `readTransaction`/`writeTransaction` called `_beginTransaction`. In 5.x, `executeRead`/`executeWrite` go through `_executeInTransaction` → a retrying `TransactionExecutor` → `ManagedTransaction.fromTransaction`; the private hook still exists at 5.28 (why PR #48 passes) but is internal. **Driver 6 removed `readTransaction`/`writeTransaction` entirely**, so the hook approach cannot survive.
2. **Not a real `Result`.** `run()` returns a plain `{records, summary}` from `storedToLive` (`src/custom/response/storedToLive.ts:11-27`). `await session.run()` works, but `for await (const r of result)`, `result.summary()`, `result.keys()`, `result.subscribe()`, and driver-6 `result.as(rules)` all break.
3. **`driver.executeQuery()` unmocked.** `mockDriver` only overrides `driver.session` (`src/custom/driver/mockDriver.ts:5-15`; `executeQuery`/`verify*`/`supports*` are commented-out stubs at `:10-12`). `@neo4j/graphql` 7 calls `session.run`, `executeRead`, `executeWrite`, **and** `driver.executeQuery`.

#### Planning Context

**Key requirements**
- Stop patching a real session/driver. Implement duck-typed `MockDriver`, `MockSession`, `MockTransaction` covering only the **public** API, so one codebase works on driver 5.x and 6.x.
- `run()` must return a **real** `Result` constructed as `new Result(Promise.resolve(observer), query, params)` with a fake `ResultStreamObserver` whose `subscribe(o)` replays `o.onKeys(keys)`, `o.onNext(record)` per record, `o.onCompleted(summary)` (and `o.onError(err)` on failure), plus no-op `cancel`/`pause`/`resume`/`prepareToHandleSingleResponse`/`markCompleted`.
- The summary must be a **real** `ResultSummary(query, params, metadata, protocolVersion)` built from the stored metadata, yielding genuine `counters.updates()`/`containsUpdates()` and removing the hand-made `summary.counters.updates` shim (`storedToLive.ts:19-24`). Keep `summary.transactionType` ('READ'/'WRITE') as an extra property for backward compatibility.
- `MockDriver.executeQuery()` returns a real `EagerResult`, honouring `config.resultTransformer` if present.
- Preserve the query-set matcher exactly: whitespace-normalised query equality (`removeExtraWhite`, `mockSessionFromQuerySet.ts:35-37`), params subset check (`isSubset`, `:60`), ordered search, and the two error messages (`:28-33`).
- Keep every currently-exported name and keep all 41 passing tests green, rewriting only the tests that assert the monkeypatch itself.

**Decisions made (with rationale)**
- **Q1 → B (two releases).** Compatibility was scored 4/5 because this is a deliberate breaking change. Mitigation: ship PR #48's minimal 5.28 bump first as a non-breaking **minor** (unblocks driver-4.4 users immediately, keeps monkeypatch), then ship the redesign as **2.0**. Reduces risk and gives users a stepping stone.
- **Q2 → B.** `neo4j-driver` becomes a **peerDependency `>=5 <7`** (bounded to tested majors; excludes an untested future driver 7), with `neo4j-driver` 6.x in `devDependencies`. The direct `neo4j-driver-core` dependency is dropped (its value exports — `Result`, `ResultSummary`, `EagerResult`, `Record`, `int` — are re-exported from `neo4j-driver`).
- **Q3 → A.** Export `mockResultsFromCapturedOutput` as a working, documented alias of the equivalent existing function, because the Neo4j blog tutorial still points people at that name.
- **Q4 → B.** Implement `mockGetSession` (closes #37); leave #40 open with a note that the remaining neo-forte helpers (e.g. `wrapConsoleLogResults`) belong to the neo-forte follow-up.
- **Q5 → A.** Save inferred project goals to `.hublaunch/goals.md`.

**Out of scope**
- neo-forte (separate repo, still on driver 5.24 using only `session.run`).
- Query-spec generation (#44 in neo-forte / draft PR #57 there).
- The #40 neo-forte-oriented helpers beyond `mockGetSession`.

## Detailed Requirements

### Functional
- `session.run(query, params)` returns a real `Result` that behaves identically under every consumption style: `await` (→ `{records, summary}`), `.records`, `.keys()`, `for await (…)`, `.summary()`, `.subscribe(observer)`, and driver-6 `.as(rules)`.
- `MockSession` implements `run`, `beginTransaction`, `executeRead`, `executeWrite`, `lastBookmarks`, `lastBookmark` (5.x compat), `close`; and keeps `readTransaction`/`writeTransaction` as **aliases** of `executeRead`/`executeWrite` for 5.x users.
- `MockTransaction` (used for both explicit `beginTransaction` and managed `executeRead`/`executeWrite`) implements `run`, `commit`, `rollback`, `close`, `isOpen`.
- `MockDriver` implements `session(config?)`, `executeQuery(query, params?, config?)` → real `EagerResult` (honour `config.resultTransformer`), `close()`, `verifyConnectivity()` (resolves void/ServerInfo), `getServerInfo()`, `verifyAuthentication()`, `supportsMultiDb()`, `supportsTransactionConfig()`, `supportsUserImpersonation()`, `supportsSessionAuth()`, `isEncrypted()`, `getNegotiatedProtocolVersion()`.
- Query-set matching is byte-for-byte the current behaviour (normalised query equality, subset params, ordered search, identical error messages).
- Errors (from a custom run function, or an unmatched query) surface consistently: `await` rejects, async iteration throws, `subscribe` calls `onError`.
- All currently-exported names remain exported: `mockSessionFromQuerySet`, `mockSessionFromFunction`, `mockResultsFromData`, `testQuerySet`, `mockDriver`, `dataToLive`, `dataToStored`, `storedToLive`, `storedToData`, `liveToStored`, `liveToData`, `wrapCopiedResults`, `getDatabaseInfo`, plus the re-exported types (`DatabaseInfo`, `QuerySpec`, `StoredResponse`, `StoredRecord`, `LiveResponse`).
- New exports: `MockOutput` (type alias of `StoredResponse`), `mockResultsFromCapturedOutput` (alias of `mockResultsFromData`), `anyValue` (wildcard sentinel), `mockGetSession`.

### Technical
- `neo4j-driver` is a **peerDependency** `>=5 <7`; `neo4j-driver` 6.x in `devDependencies`; `neo4j-driver-core` removed from `dependencies`.
- Value imports (`Result`, `ResultSummary`, `EagerResult`, `Record`, `int`, `auth`, `driver`) come from `'neo4j-driver'`. Type imports move off `'neo4j-driver-core/types/…'` to `'neo4j-driver'` (per PR #48).
- `src/index.ts` converts from `export const x = require(...)` to ES `export { x } from './…'`, keeping every name and preserving the `ns__file`/`ns__custom` scaffolding markers (`src/index.ts:1-6,10,38`).
- `engines.node` → `>=18`. TypeScript `^4.1.3` → `5.x`. ava `^3.15.0` → `6.x`. `@types/node` → an 18+ line. **nyc kept as-is** (not swapped to c8) to minimise churn.
- `disableLosslessIntegers` behaviour preserved: the mock honours the session/driver config flag the same way `driverFromDatabaseInfo.ts:12` does today.

### Non-Functional
- No behavioural regression for existing consumers of the public API.
- Two clean conventional-commits releases: Release 1 `feat:` (minor), Release 2 `feat!:` + `BREAKING CHANGE:` footer (major), driven by the existing semantic-release config (`.releaserc.json`).
- dnorton's git authorship on the PR #48 commits is preserved; credit is explicit in PR body and changelog.

## Proposed Solution

Two sequential releases off `main`.

**Release 1 (minor):** Land dnorton's PR #48 work — bump neo4j-driver/-core to 5.28.x, convert `index.ts` to ES exports, switch type imports from `neo4j-driver-core/types/...` to `neo4j-driver` — by **cherry-picking dnorton's commits** so they stay the git author, then fixing whatever fails against today's `main` in follow-up commits. Keeps the monkeypatch design; ships as a non-breaking `feat:`.

**Release 2 (major 2.0):** Replace the monkeypatch with real duck-typed classes that return genuine driver objects, close the backlog, and do the housekeeping. The data flow for a mocked `run()`:

```
QuerySpec[] ──match──► StoredResponse
                           │
            storedToData / dataToLive ──► Record[]  (neo4j-driver-core Record instances)
                           │                 │
            ResultSummary(query,params,       │
              metadata,protocolVersion)       │
                           └──────┬───────────┘
                                  ▼
                 fake ResultStreamObserver.subscribe(o):
                   o.onKeys(keys) ; o.onNext(record)×N ; o.onCompleted(summary)
                                  ▼
                 new Result(Promise.resolve(observer), query, params)  ◄── real Result
                                  ▼
   MockSession.run ─┐     MockDriver.executeQuery ─► new EagerResult (records,summary,keys)
   MockTransaction.run ─┘                           (apply config.resultTransformer if present)
```

`MockSession` and `MockTransaction` share one query-runner (the preserved matcher) that produces the fake observer; `MockDriver.executeQuery` eagerly drains a `Result` into an `EagerResult`.

## Technical Considerations

- **Dependencies:** peerDependency `neo4j-driver` `>=5 <7`; devDependency `neo4j-driver` `6.x`; remove `neo4j-driver-core` from `dependencies`. Bump `@neo4j/graphql` to `7.x` (dev), drop `apollo-server` (dev), bump `graphql` to a version compatible with `@neo4j/graphql` 7, TypeScript `5.x`, ava `6.x`, `@types/node` 18+.
- **Config/build:** `engines.node >=18`; update `tsconfig` target/lib only if the TS 5 bump requires it; keep `lib/**/*` publish layout (`package.json:11-13`), `main`/`types` unchanged.
- **Private-API verification (blocking at implementation time):** `node_modules` is not installed in the planning sandbox, so `new Result(Promise.resolve(observer), …)`, `EagerResult`, and `.as()` could **not** be re-verified here. The request states these were verified against driver 6.3.0 in a prototype. The implementer **must** re-verify against the installed driver 6.x (and smoke-test against 5.28) before relying on the exact `Result`/`ResultSummary`/`ResultStreamObserver` constructor signatures, since those are driver-internal shapes that can differ across majors.
- **Security:** none (test-only library, no network, no secrets; the fake URI/credentials in `mockSessionFromQuerySet.ts:8-12` are removed with the monkeypatch).

## Testing Strategy

- **Unit — fake observer:** dedicated tests for each consumption style off one `run()`: `await`, `.records`, `.keys()`, `for await`, `.summary()` (real `ResultSummary`, `counters.updates()`/`containsUpdates()` real), `.subscribe()` (onKeys/onNext×N/onCompleted ordering), and driver-6 `.as(rules)`. Error path: `await` rejects, async iteration throws, `subscribe` calls `onError` — same error object/message for all three.
- **Unit — matcher parity:** keep the existing `mockSessionFromQuerySet` tests; assert the two error messages and subset-params behaviour are unchanged.
- **Unit — issues:** #44 (`{low:0,high:0}` → converts; negative `{high:-1}` → converts; both in `neo4jIntStoredToLive` and `neo4jIntStoredToData`); #43 (predicate param value matches/rejects; `anyValue` skips the key); #47 (`MockOutput` and `mockResultsFromCapturedOutput` exported and working); #37 (`mockGetSession` returns a working session).
- **Integration — `test/custom/server.test.ts` rewrite:** replace apollo-server 2 + `@neo4j/graphql` 2 with `@neo4j/graphql` 7 via `getSchema()` + graphql-js `graphql()` (no Apollo), driven by `MockDriver`, asserting that `session.run`, `executeRead`, `executeWrite`, and `driver.executeQuery` all route through the query set.
- **Rewrite (not adapt) the monkeypatch-asserting tests:** `test/custom/mockSessionFromFunction.test.ts:13` (`session.run === fn`), `:29-35` (`session._beginTransaction()`), `test/custom/mockDriver.test.ts:8` (`result.session.toString`).
- **Adapt/confirm:** `test/custom/transaction.test.ts` and `test/custom/mockSessionFromQuerySet.test.ts:149` use `readTransaction`/`writeTransaction` and assert `summary.transactionType` — confirm the 5.x aliases and `transactionType` property survive.
- **Live-DB path:** `test/**/*.int.ts` run via `int-tests.config.cjs`; `testQuerySet` keeps a real driver/session — unchanged.
- **Gate:** all 41 current `.test.ts` pass on Node 18 and Node ≥20 against driver 6.x; smoke against 5.28. (Pre-existing modern-Node failure in the *old* `server.test.ts` disappears because that file is replaced.)

## Documentation Updates

- **README:** update Usage/Functions for the driver-6 API (`executeRead`/`executeWrite`, `executeQuery`, `Result` consumption styles); document the peer-dependency change and 5.x/6.x support; add a short **1.x → 2.0 migration note** (install `neo4j-driver` yourself, Node ≥18, monkeypatch internals gone); document `MockOutput`, `mockResultsFromCapturedOutput`, `anyValue`, `mockGetSession`; reconcile the documented `MockOutput`/`QuerySpec.output` type with the real `StoredResponse` (README:429-451). Preserve the `ns__custom`/`ns__file` template markers.
- **`.hublaunch/goals.md`:** create, with the inferred project goals (Q5=A).
- **CHANGELOG / release notes:** generated by semantic-release; ensure Release 1 body credits dnorton and references PR #48.

## Acceptance Criteria

- [ ] **Release 1:** neo4j-driver/-core bumped to 5.28.x, `index.ts` on ES exports, dnorton is the git author of those commits, PR body + changelog credit dnorton and reference #48, a thank-you comment is posted on #48; all tests pass; released as a `feat:` minor.
- [ ] **Release 2:** `MockDriver`/`MockSession`/`MockTransaction` implement the public surfaces listed in Detailed Requirements with **no** reference to `_beginTransaction` or any private member anywhere in `src/`.
- [ ] `session.run()` returns an object that passes `instanceof Result` from `'neo4j-driver'`, and `await`, `.records`, `.keys()`, `for await`, `.summary()`, `.subscribe()`, `.as()` all work.
- [ ] `result.summary()` returns a real `ResultSummary`; `counters.updates()` and `containsUpdates()` work without the `storedToLive` shim; `summary.transactionType` is `'READ'`/`'WRITE'` where applicable.
- [ ] `driver.executeQuery()` returns a real `EagerResult` and applies `config.resultTransformer` when supplied.
- [ ] `neo4j-driver` is a peerDependency `>=5 <7`; `neo4j-driver` 6.x is a devDependency; `neo4j-driver-core` is absent from `dependencies`.
- [ ] `engines.node >=18`; TS 5.x; ava 6.x; nyc retained.
- [ ] Issues closed: #47, #44, #43, #37. #40 left open with an explanatory note.
- [ ] The rewritten `server.test.ts` exercises `@neo4j/graphql` 7 and proves `run`/`executeRead`/`executeWrite`/`executeQuery` route to the query set.
- [ ] All 41 existing tests pass (monkeypatch-asserting ones rewritten); README + `.hublaunch/goals.md` updated.
- [ ] Release 2 ships as `feat!:` with a `BREAKING CHANGE:` footer.

<details><summary><b>Implementation Detail</b></summary>

### Implementation Steps

#### Release 1 — minor: neo4j-driver 5.28 bump (dnorton's PR #48)
1. Fetch dnorton's fork branch `update-neo4j-driver-and-core` (PR #48). Create a local branch off `main` and **cherry-pick** dnorton's commits so `git author` stays dnorton; use `Co-authored-by` only where a squash/fix cannot preserve authorship.
2. Reconcile against today's `main`: bump `neo4j-driver`/`neo4j-driver-core` to `^5.28.1` (`package.json` `dependencies`), convert `src/index.ts` `export const x = require(...)` → `export { x } from './…'` (keep `ns__` markers), switch type imports `import Session from 'neo4j-driver-core/types/session'` → from `'neo4j-driver'` (affects `mockSessionFromQuerySet.ts:2`, `mockSessionFromFunction.ts:2`, `mockDriver.ts:1`, and any other `neo4j-driver-core/types/...` imports).
3. Run `npm test`; fix type/test breakage in follow-up commits (your own authorship). Keep the monkeypatch design intact for this release.
4. Open the PR with warm, explicit credit to dnorton in title/body; post a thank-you on #48 explaining their commits were landed with authorship preserved. Merge as a `feat:` (minor) release.

#### Release 2 — major 2.0: the redesign
5. **Dependencies/engines (`package.json`):** move `neo4j-driver` to `peerDependencies` `">=5 <7"`; add `neo4j-driver` `^6` to `devDependencies`; remove `neo4j-driver-core` from `dependencies`; set `engines.node` `">=18"`; bump `typescript`→`^5`, `ava`→`^6`, `@types/node`→`^18` (or 20); bump `@neo4j/graphql`→`^7` and `graphql` to its compatible range (dev); remove `apollo-server` (dev); keep `nyc`.
6. **Real-result core (new module, e.g. `src/custom/result/`):**
   - A `makeResult(query, params, storedResponse, config)` helper that: builds `Record[]` via `storedToData`→`dataToLive` (reuse `src/custom/response/dataToLive.ts` + `recordConversion/*`); builds the real `ResultSummary(query, params, metadata, protocolVersion)` from `storedResponse.summary` (metadata keys the driver reads: `db`, `plan`, `profile`, `result_available_after`, `result_consumed_after`, `server`, `stats`, `type`); creates a fake `ResultStreamObserver` whose `subscribe(o)` calls `o.onKeys(keys)`, `o.onNext(record)` per record, `o.onCompleted(summary)`, with no-op `cancel`/`pause`/`resume`/`prepareToHandleSingleResponse`/`markCompleted`; and returns `new Result(Promise.resolve(observer), query, params)` (value imports from `'neo4j-driver'`). Stamp `summary.transactionType` where a transaction type applies.
   - An error variant: when the matcher throws or a custom run function rejects, the observer's `subscribe(o)` calls `o.onError(err)` (and the `Result` promise rejects), so `await`/iteration/`subscribe` all surface the same error.
7. **`MockSession` (`src/custom/session/`):** a class/factory with the preserved matcher (copy `removeExtraWhite` `mockSessionFromQuerySet.ts:35-37`, ordered loop + `isSubset` `:55-64`, error messages `:28-33`). Methods: `run`→`makeResult`; `beginTransaction`→`MockTransaction`; `executeRead`/`executeWrite`→run the work function against a managed `MockTransaction` (type `'READ'`/`'WRITE'`); `readTransaction`/`writeTransaction` as aliases; `lastBookmarks`/`lastBookmark` (return a stable fake/empty bookmark); `close`. Rewrite `mockSessionFromQuerySet` and `mockSessionFromFunction` to return a `MockSession` (no real driver, no fake URI, no `_beginTransaction`). Honour `config.disableLosslessIntegers` as `driverFromDatabaseInfo.ts:12` does.
8. **`MockTransaction` (`src/custom/transaction/`):** `run`→`makeResult` (stamp `transactionType`); `commit`/`rollback`/`close`→resolve and flip `_isOpen=false`; `isOpen`.
9. **`MockDriver` (`src/custom/driver/mockDriver.ts`):** replace the real-driver override (`:5-15`) with a class implementing `session(config?)` (returns the provided `MockSession`), `executeQuery(query, params?, config?)` (run the matcher, build an `EagerResult` `{records, summary, keys}`; apply `config.resultTransformer` if present), `close`, `verifyConnectivity`, `getServerInfo`, `verifyAuthentication`, `supportsMultiDb`, `supportsTransactionConfig`, `supportsUserImpersonation`, `supportsSessionAuth`, `isEncrypted`, `getNegotiatedProtocolVersion`. Keep the `mockDriver(session, databaseInfo?)` signature.
10. **Issue #44 (`src/custom/neo4jInts/neo4jIntStoredToLive.ts:11-16`, `neo4jIntStoredToData.ts:9-14`):** change the guard from `item.high === 0 && item.low && typeof item.low === 'number'` to `typeof item.low === 'number' && (item.high === 0 || item.high === -1)` so `low:0` converts and negative lossless integers (`high === -1`) are detected. Apply in both files.
11. **Issue #43 (`src/custom/types/QuerySpec.ts:3-12` + matcher):** add an exported `anyValue` sentinel; widen `ParamSet` value type to `any | ((actual: any) => boolean) | typeof anyValue`; in the subset check, for each expected key: if value is `anyValue` → skip; if value is a function → call it with the actual value and require `true`; else fall back to the existing `isSubset`/equality.
12. **Issue #47 (`src/custom/types/StoredResponse.ts`, `src/index.ts`):** add `export type MockOutput = StoredResponse`; export `mockResultsFromCapturedOutput` as an alias of `mockResultsFromData` (from `dataToLive.ts`).
13. **Issue #37:** add `mockGetSession(querySet)` = `mockDriver(mockSessionFromQuerySet(querySet)).session()`; export it. Leave #40 open with a note (the remaining neo-forte helpers belong to the neo-forte follow-up).
14. **`storedToLive.ts`:** remove the `summary.counters.updates` shim (`:19-24`); keep the function as the record/summary source feeding `makeResult`. Confirm `mockResultsFromData` consumers still get the expected shape.
15. **`src/index.ts`:** ensure every existing name plus the new ones (`MockOutput`, `mockResultsFromCapturedOutput`, `anyValue`, `mockGetSession`) are exported via ES syntax; keep `ns__` markers.
16. **Tests:** rewrite `test/custom/server.test.ts` (step: `@neo4j/graphql` 7 `getSchema()` + `graphql()` on `MockDriver`); rewrite the monkeypatch-asserting tests (`mockSessionFromFunction.test.ts:13,29`, `mockDriver.test.ts:8`); add fake-observer per-consumption-style tests and issue-specific tests; confirm `transaction.test.ts` / `mockSessionFromQuerySet.test.ts:149` still pass.
17. **Docs/release:** README updates + `.hublaunch/goals.md`; release as `feat!:` with `BREAKING CHANGE:` footer.

### Edge Cases
- Empty record set: observer still calls `onKeys([...])` then `onCompleted(summary)`; `await` yields `{records: [], summary}`.
- `disableLosslessIntegers`: when true, integers are plain numbers (matches `driverFromDatabaseInfo.ts:12`); when false, real `Integer` instances via `neo4j.int`.
- `config.resultTransformer` on `executeQuery`: when absent, default to the standard eager `{records, summary, keys}` shape; when present, return its output verbatim.
- Params subset with `anyValue`/predicate interacting with nested objects (#43 applies at the top-level key per the escape hatch; keep nested behaviour on `isSubset`).
- Zero vs negative integers (#44): `{low:0,high:0}`→0; `{low:-1,high:-1}` and other `high===-1` forms→negative value.
- Managed-transaction retry: `executeRead`/`executeWrite` run the work function once against a `MockTransaction` (no real retry needed; the mock never produces transient errors).

### Error Handling
- Unmatched query / matched-query-unmatched-params: throw the existing messages (`mockSessionFromQuerySet.ts:28-33`); surfaced via `onError`/promise rejection so `await`, `for await`, and `subscribe` all fail identically.
- Custom run function rejection (`mockSessionFromFunction`): propagate the same way.

### Performance
- Negligible; test-only. Eager draining in `executeQuery` is bounded by the stored record count.

### Observability
- None beyond the existing error messages (which already echo the query/params, truncated at 1500 chars, `mockSessionFromQuerySet.ts:17-18`).

### Rollout / Migration
- Release 1 unblocks driver-4.4 users with no breaking change. Release 2 is a major: consumers must add `neo4j-driver` (>=5 <7) themselves and be on Node ≥18. README migration note covers this. semantic-release handles version/changelog from the conventional-commit footers.

### Dependencies & Related Work
- Community PR #48 (dnorton) — landed in Release 1 with authorship preserved and explicit credit.
- Closes #47, #44, #43, #37; #40 left open (neo-forte follow-up).
- Related but out of scope: neo-forte (driver 5.24), query-spec generation (neo-forte #44 / draft PR #57).

</details>

## Assumptions

1. **Repo drift:** The current checkout is at commit `150b88f` — identical to the Repo Snapshot — so all `file:line` references in this plan were verified directly; no drift.
2. **Peer dependency:** `neo4j-driver` is a peerDependency `">=5 <7"`; `neo4j-driver` 6.x in devDependencies; `neo4j-driver-core` dropped from `dependencies` and imported transitively via `neo4j-driver` (value exports `Result`, `ResultSummary`, `EagerResult`, `Record`, `int`). (Q2=B.)
3. **Two releases:** Release 1 (minor, dnorton's 5.28 bump, authorship preserved + explicit credit) then Release 2 (major 2.0 redesign). (Q1=B.)
4. **#44 fix:** guard switched to `typeof item.low === 'number' && (item.high === 0 || item.high === -1)` in both `neo4jIntStoredToLive.ts` and `neo4jIntStoredToData.ts`; no new public API.
5. **#43 escape hatch:** both a predicate `(actual) => boolean` param value and an exported wildcard sentinel named `anyValue`; `QuerySpec.params` value type widens to `any | ((actual:any)=>boolean) | typeof anyValue`. (Naming is a soft assumption, flagged not asked, since the request proposed it.)
6. **#47:** `MockOutput` exported as a type alias of `StoredResponse`; `mockResultsFromCapturedOutput` exported as a working, documented alias of `mockResultsFromData`. (Q3=A.)
7. **#37/#40:** `mockGetSession(querySet)` implemented (thin wrapper `mockDriver(mockSessionFromQuerySet(querySet)).session()`), closing #37; #40 left open with a note. (Q4=B.)
8. **server.test.ts rewrite:** uses `@neo4j/graphql` 7 `getSchema()` + graphql-js `graphql()` (no Apollo), driven by `MockDriver`, asserting `run`/`executeRead`/`executeWrite`/`executeQuery` all route through the query set.
9. **Build tooling:** TypeScript → 5.x, ava → 6.x, `@types/node` → 18+; **nyc kept as-is** (not swapped to c8) to minimise churn. (Veto-able.)
10. **engines.node → `>=18`**; CI matrix (if present) updated to Node ≥18, or left untouched if CI already moved elsewhere.
11. **Single major release** via existing semantic-release config (`feat!:` + `BREAKING CHANGE:`); PR #48 credited in changelog/PR body, its fork branch not merged separately.
12. **Signatures preserved:** all six format-conversion functions, `wrapCopiedResults`, `getDatabaseInfo`, and `testQuerySet` keep current signatures/behaviour; `testQuerySet` keeps a **real** driver/session (live-DB verification, not a mock).
13. **Scaffolding preserved:** `ns__custom`/`ns__file` ts-packrat/geenee markers in `index.ts` and `README.md` are kept (template-generated repo).
14. **Test layout preserved:** `.test.ts` + `.int.ts` split and ts-node registration stay; only versions change.
15. **`disableLosslessIntegers`** behaviour preserved exactly as `driverFromDatabaseInfo.ts:12` does today.
16. **Prototype re-verification required:** `new Result(Promise.resolve(observer), …)`, `EagerResult`, and `.as()` were stated as verified against driver 6.3.0 but could not be re-confirmed in the planning sandbox (no `node_modules`); the implementer must re-verify against the installed driver 6.x (and smoke-test 5.28) before relying on these driver-internal constructor shapes.
17. **Goals file:** `.hublaunch/goals.md` is created with the inferred project goals as part of this work. (Q5=A.)
