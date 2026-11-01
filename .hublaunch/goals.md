# neo-forgery — Project Goals

_Inferred from the codebase, README, and the driver-6 modernization work. Captured per planning decision Q5=A._

## Mission

Make mocking a `neo4j-driver` session **fast and simple** so that code which queries Neo4j can be unit-tested without a live database. Unit tests must be instant (CI/TDD-friendly); a query is treated as an opaque string whose response is predictable and unchanging.

## Core goals

1. **Mock from a query set.** Given an array of `QuerySpec` (query string, optional params, expected output), produce a session that answers matching `run`/transaction calls from the stored output and throws clear, query-echoing errors on a miss.
2. **Behave like the real driver.** `session.run()` returns a genuine `Result`; `driver.executeQuery()` returns a genuine `EagerResult`; summaries are real `ResultSummary` objects. Every consumption style works (`await`, `for await`, `.records`, `.keys()`, `.summary()`, `.subscribe()`, driver-6 `.as()`).
3. **Stay current with neo4j-driver.** Support the actively-maintained driver majors (currently **5.x and 6.x**) via a public-API-only, duck-typed implementation — no reliance on private driver internals — declared as a peer dependency.
4. **Integrate with `@neo4j/graphql`.** A mock driver can back a `@neo4j/graphql` schema so that `run`, `executeRead`, `executeWrite`, and `executeQuery` all route through the query set.
5. **Format conversions.** Provide lossless conversions among the three result formats — `stored`, `live`, and `data` — plus helpers (`wrapCopiedResults`, `mockResultsFromData` / `mockResultsFromCapturedOutput`).
6. **Validate mocks against a live DB (opt-in).** `testQuerySet` checks a query set against a real database so stale mocks can be caught after schema changes. This is explicitly **not** for unit tests.

## Non-goals / intentional limits

- No testing of data updates or of the database server itself.
- One result per query/param combination (sequence-of-results is a known future enhancement).
- The optional `config` parameter of `Session.run()` is not fully modelled.
- Integers must stay within the JavaScript safe range.

## Quality bar

- TypeScript, built with `tsc`, linted with ESLint (zero warnings), tested with AVA.
- No behavioural regressions to the public API across releases.
- Releases follow Conventional Commits and are published via semantic-release.

## Related

- [neo-forte](https://www.npmjs.com/package/neo-forte) — a companion package; shared mission that programming with neo4j should be simple. Issue #40 (remaining neo-forte-oriented helpers such as `wrapConsoleLogResults`) is tracked for a neo-forte follow-up.
