import { Neo4jGraphQL } from '@neo4j/graphql';
import { ApolloServer } from 'apollo-server';
import { mockDriver } from '../../src/custom/driver/mockDriver';
import { mockSessionFromQuerySet } from '../../src';
import { cypherParams, movieOutputWithoutReleased, movieParams } from './data/helpers/serverQuerySet';
import { querySet } from './data/helpers/serverQuerySet';
import { getDatabaseInfo } from '../../src/custom/database/getDatabaseInfo';
import Driver from 'neo4j-driver-core/types/driver';
import { storedToLive } from '../../src/custom/response/storedToLive';
import {DELETE_BOOKS_MUTATION, DELETE_BOOKS_PARAMS} from "./data/deleteBooks";

const test = require('ava');

const user = {
  'id': 'f5224bcb-12d7-48d3-8943-4fa862afa1ec',
  'roles': ['moderator'],
};

const typeDefs = `
type Movie {
    title: String!
    released: Int
}
type Book {
  title: String
  author: String
}
type Query {
    getMovies (title: String!): [Movie] @cypher(statement: "match (movie:Movie {title:$title}) return movie")
}
`;

const schema = new Neo4jGraphQL({
  typeDefs,
}).schema;


function getContext(driver: Driver) {
  return async function context({ event, context }: { event: any, context: any }) {
    return ({
      event,
      context,
      driver,
      user,
      cypherParams,
    });
  };
}

function createServer(context: Function) {
  return new ApolloServer(
    {
      schema,
      context,
      cors: {
        origin: '*',
        methods: 'GET,HEAD,POST',
      },
      introspection: true,
    });
}

// new ApolloServer(
// {
//   schema,
//   context,
//   cors: {
//     origin: '*',
//     methods: 'GET,HEAD,POST',
//   },
//   introspection: true,
// });

const MOVIES = `
query GetMovies($title: String!){
  getMovies(title: $title){
   title
  }
}
`;

test('spoof simple server', async (t: any) => {
  const session = mockSessionFromQuerySet(querySet);
// const databaseInfo = getDatabaseInfo(
//   process.env.URI,
//   process.env.USER_NAME,
//   process.env.PASSWORD
// )
// const driver = mockDriver(session, databaseInfo);
  const driver = mockDriver(session);
  const context = getContext(driver);
  const server = createServer(context);
  const result = await server.executeOperation({
    query: MOVIES,
    variables: movieParams,
  });
  t.true(!result.errors);

  t.deepEqual(
    // @ts-ignore
    result.data.getMovies,
    storedToLive(movieOutputWithoutReleased)
      .records.map(record => record.get('movie').properties),
  );
});


test('spoof simple server with db credentials', async (t: any) => {
  const session = mockSessionFromQuerySet(querySet);
  
  const databaseInfo = getDatabaseInfo(
    'neo4j+s://77777777.databases.neo4j.io',
    'neo4j',
    'letMeIn!123',
  );
  const driver = mockDriver(session, databaseInfo);
  const context = getContext(driver);
  const server = createServer(context);
  const result = await server.executeOperation({
    query: MOVIES,
    variables: movieParams,
  });

  t.true(!result.errors);

  t.deepEqual(
    // @ts-ignore
    result.data.getMovies,
    storedToLive(movieOutputWithoutReleased)
      .records.map(record => record.get('movie').properties),
  );
});

test.skip('spoof simple server deletion', async (t: any) => {
  const session = mockSessionFromQuerySet(querySet);
  const driver = mockDriver(session);
  const context = getContext(driver);
  const server = createServer(context);
  const result = await server.executeOperation({
    query: DELETE_BOOKS_MUTATION,
    variables: DELETE_BOOKS_PARAMS,
  });

  console.log(`result.errors=${JSON.stringify(result.errors, null, 2)}`);

  t.true(result.errors === undefined);

  if (!result.data) throw new Error('no results for deleteBooks')
  t.true(result.data.deleteBooks.nodesDeleted && result.data.deleteBooks.nodesDeleted > 0);
});
