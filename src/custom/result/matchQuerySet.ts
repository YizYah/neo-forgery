import { QuerySpec } from '../types/QuerySpec';
import { StoredResponse } from '../types/StoredResponse';
import { paramsMatch } from './paramsMatch';

const queryInfo = (params: any, query: string): string => {
  let paramsString = JSON.stringify(params);
  const MAX_LENGTH = 1500;
  if (paramsString && paramsString.length > MAX_LENGTH)
    paramsString = paramsString.substring(0, MAX_LENGTH) + '...';
  return `
query:
-----------------
${query.trim()}
-----------------
params: ${paramsString}
`;
};

const errorMessageContentsQueryMatched = (params: any, query: string): string =>
  `your query was matched in your QuerySpec. But your params were not matched:
${queryInfo(params, query)}`;

const errorMessageContentsQueryNotMatched = (params: any, query: string): string =>
  `the query set provided does not contain the given query:
${queryInfo(params, query)}`;

function removeExtraWhite(inString: string): string {
  return inString.trim().replace(/\s+/g, ' ');
}

// Finds the stored response for a query/params pair in the query set, preserving the
// original matching semantics: whitespace-normalised query equality, ordered search,
// subset params, and the two error messages. Throws when nothing matches.
export function matchQuerySet(
  querySet: QuerySpec[],
  query: string,
  params: any,
): StoredResponse {
  let queryMatched = false;

  for (let index = 0; index < querySet.length; index++) {
    const querySpec: QuerySpec = querySet[index];

    if (removeExtraWhite(querySpec.query) === removeExtraWhite(query)) {
      queryMatched = true;
      if (!querySpec.params || paramsMatch(params, querySpec.params)) {
        return querySpec.output;
      }
    }
  }

  if (queryMatched) {
    throw new Error(errorMessageContentsQueryMatched(params, query));
  }

  throw new Error(errorMessageContentsQueryNotMatched(params, query));
}
