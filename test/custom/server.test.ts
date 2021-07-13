import { Neo4jGraphQL } from '@neo4j/graphql';
import { ApolloServer } from 'apollo-server';
import { mockDriver } from '../../src/custom/driver/mockDriver';
import { mockSessionFromQuerySet } from '../../src';
import { cypherParams, movieOutputWithoutReleased, movieParams } from './data/helpers/serverQuerySet';
import { querySet } from './data/helpers/serverQuerySet';
import { getDatabaseInfo } from '../../src/custom/database/getDatabaseInfo';
import Driver from 'neo4j-driver-core/types/driver';
import { storedToLive } from '../../src/custom/response/storedToLive';

require('dotenv').config();
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


// function context({ event, context }: { event: any, context: any }): any {
//   return ({
//     event,
//     context,
//     driver,
//     user,
//     cypherParams,
//   });
// }

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
   #released
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
    process.env.URI,
    process.env.USER_NAME,
    process.env.PASSWORD,
  );
  const driver = mockDriver(session, databaseInfo);
  const context = getContext(driver);
  const server = createServer(context);
  const result = await server.executeOperation({
    query: MOVIES,
    variables: movieParams,
  });
  // console.log(`movieOutput.records=${JSON.stringify(movieOutput.records)}`);
  // console.log(`mockResultsFromCapturedOutput(movieOutput).records=${JSON.stringify(mockResultsFromCapturedOutput(movieOutput).records)}`);
  t.true(!result.errors);

  t.deepEqual(
    // @ts-ignore
    result.data.getMovies,
    storedToLive(movieOutputWithoutReleased)
      .records.map(record => record.get('movie').properties),
  );
});
