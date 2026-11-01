import { anyValue } from '../types/QuerySpec';

const isSubset = require('is-subset');

// Decides whether the actual params satisfy the expected params of a QuerySpec.
//
// Each expected key supports three matching styles (issue #43):
//   - `anyValue`  → the key is accepted whatever the actual value is (wildcard).
//   - a predicate `(actual) => boolean` → the key is accepted when the predicate returns true.
//   - anything else → the existing subset/equality behaviour (via `is-subset`).
export function paramsMatch(actual: any, expected: any): boolean {
  const subsetExpected: any = {};

  for (const key of Object.keys(expected)) {
    const expectedValue = expected[key];

    if (expectedValue === anyValue) continue;

    if (typeof expectedValue === 'function') {
      const actualValue = actual ? actual[key] : undefined;
      if (!expectedValue(actualValue)) return false;
      continue;
    }

    subsetExpected[key] = expectedValue;
  }

  return isSubset(actual, subsetExpected);
}
