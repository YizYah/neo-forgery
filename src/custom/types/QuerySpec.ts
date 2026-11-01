import { StoredResponse } from './StoredResponse';

// A wildcard sentinel for QuerySpec params (issue #43). Using it as an expected param value
// makes the matcher accept that key whatever the actual value is.
export const anyValue: unique symbol = Symbol('neo-forgery:anyValue');

// A param matcher is either a concrete value (subset/equality match), a predicate that
// receives the actual value and returns whether it matches, or the `anyValue` wildcard.
export type ParamMatcher = any | ((actual: any) => boolean) | typeof anyValue;

interface ParamSet {
  [param: string]: ParamMatcher;
}

export interface QuerySpec {
  name?: string;
  query: string;
  output: StoredResponse;
  params?: ParamSet;
}
