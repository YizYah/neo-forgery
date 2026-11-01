import test from 'ava';
import { Neo4jGraphQL } from '@neo4j/graphql';
import { graphql, GraphQLSchema } from 'graphql';
import { mockDriver } from '../../src/custom/driver/mockDriver';
import { mockSessionFromQuerySet } from '../../src';
import {
  typeDefs,
  querySet,
  MOVIES_OPERATION,
  DELETE_BOOKS_MUTATION,
  DELETE_BOOKS_VARIABLES,
  expectedMovies,
} from './data/helpers/serverQuerySet';

// A single schema instance is reused across tests.
let schema: GraphQLSchema;
const getSchema = async (): Promise<GraphQLSchema> => {
  if (!schema) schema = await new Neo4jGraphQL({ typeDefs }).getSchema();
  return schema;
};

// Wraps a mock session/driver so we can assert which methods @neo4j/graphql routes through.
function spy(target: any, methods: string[], log: string[], prefix: string): any {
  return new Proxy(target, {
    get(obj, prop, receiver) {
      const value = Reflect.get(obj, prop, receiver);
      if (typeof value === 'function' && methods.includes(prop as string)) {
        return (...args: any[]) => {
          log.push(`${prefix}.${String(prop)}`);
          return value.apply(obj, args);
        };
      }
      return value;
    },
  });
}

test('@neo4j/graphql 7 read routes through the query set via executeRead', async (t) => {
  const calls: string[] = [];
  const session = spy(
    mockSessionFromQuerySet(querySet),
    ['run', 'executeRead', 'executeWrite'],
    calls,
    'session',
  );
  const driver = mockDriver(session);

  const result: any = await graphql({
    schema: await getSchema(),
    source: MOVIES_OPERATION,
    contextValue: { executionContext: driver },
  });

  t.falsy(result.errors);
  t.deepEqual(result.data.movies, expectedMovies);
  t.true(calls.includes('session.executeRead'));
});

test('@neo4j/graphql 7 mutation routes through the query set via executeWrite', async (t) => {
  const calls: string[] = [];
  const session = spy(
    mockSessionFromQuerySet(querySet),
    ['run', 'executeRead', 'executeWrite'],
    calls,
    'session',
  );
  const driver = mockDriver(session);

  const result: any = await graphql({
    schema: await getSchema(),
    source: DELETE_BOOKS_MUTATION,
    variableValues: DELETE_BOOKS_VARIABLES,
    contextValue: { executionContext: driver },
  });

  t.falsy(result.errors);
  t.is(result.data.deleteBooks.nodesDeleted, 1);
  t.true(calls.includes('session.executeWrite'));
});

test('driver.executeQuery routes through the query set', async (t) => {
  const session = mockSessionFromQuerySet(querySet);
  const driver: any = mockDriver(session);

  const eager = await driver.executeQuery(
    `CYPHER 5
MATCH (this:Movie)
RETURN this { .title } AS this`,
  );

  t.deepEqual(eager.keys, ['this']);
  t.is(eager.records.length, 1);
  t.deepEqual(eager.records[0].get('this'), { title: 'Forrest Gump' });
});
