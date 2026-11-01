import { QuerySpec } from '../../../../src/custom/types/QuerySpec';

// GraphQL type definitions exercised by the server integration test. `@neo4j/graphql` 7
// requires the `@node` directive to treat a type as a node.
export const typeDefs = `
type Movie @node {
  title: String!
  released: Int
}
type Book @node {
  title: String
  author: String
}
`;

// The GraphQL operations the test runs.
export const MOVIES_OPERATION = `
query GetMovies {
  movies {
    title
  }
}
`;

export const DELETE_BOOKS_MUTATION = `
mutation ($bookWhere: BookWhere){
  deleteBooks(where: $bookWhere) {
    nodesDeleted
  }
}
`;

export const DELETE_BOOKS_VARIABLES = {
  bookWhere: {
    title: { eq: 'Gatsby JS' },
    author: { eq: 'F. Scott Fitzgerald' },
  },
};

export const expectedMovies = [{ title: 'Forrest Gump' }];

// `@neo4j/graphql` 7 probes the server version before every operation; the mock answers it
// from the query set too.
const componentsResponse = {
  records: [
    {
      keys: ['version', 'edition'],
      length: 2,
      _fields: ['5.26.0', 'enterprise'],
      _fieldLookup: { version: 0, edition: 1 },
    },
  ],
  summary: { queryType: 'r', counters: { _stats: {} } },
};

// The Cypher strings below are exactly what `@neo4j/graphql` 7 generates for the operations
// above. The matcher normalises whitespace, so formatting differences are irrelevant.
export const querySet: QuerySpec[] = [
  {
    name: 'components',
    query: `CYPHER 5
CALL dbms.components() YIELD versions, edition UNWIND versions AS version RETURN version, edition`,
    output: componentsResponse,
  },
  {
    name: 'movies',
    query: `CYPHER 5
MATCH (this:Movie)
RETURN this { .title } AS this`,
    output: {
      records: [
        {
          keys: ['this'],
          length: 1,
          _fields: [{ title: 'Forrest Gump' }],
          _fieldLookup: { this: 0 },
        },
      ],
      summary: { queryType: 'r', counters: { _stats: {} } },
    },
  },
  {
    name: 'deleteBooks',
    query: `CYPHER 5
MATCH (this:Book)
WHERE (this.title = $param0 AND this.author = $param1)
DETACH DELETE this`,
    params: { param0: 'Gatsby JS', param1: 'F. Scott Fitzgerald' },
    output: {
      records: [],
      summary: {
        queryType: 'w',
        counters: { _stats: { nodesDeleted: 1 } },
        updateStatistics: { _stats: { nodesDeleted: 1 } },
      },
    },
  },
];
