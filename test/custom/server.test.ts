import { mockResultsFromCapturedOutput } from '../../src/custom/results/mockResultsFromCapturedOutput';

require('dotenv').config();
const test = require('ava');

import {
  cypherParams,
  movieOutput,
  movieOutputWithoutReleased,
  movieParams,
  movieQuery,
  querySet,
} from './data/helpers/serverQuerySet';
import { Neo4jGraphQL } from '@neo4j/graphql';
import { ApolloServer } from 'apollo-server';
// import { dataFromRecordList } from '../../src/custom/records/dataFromRecordList';

const neo4j = require('neo4j-driver');

const mockSessionFromQuerySet = require('../../src/custom/session/mockSessionFromQuerySet');

function mockDriver() {
  const driver = neo4j.driver(
    process.env.URI,
    neo4j.auth.basic(
      process.env.USER_NAME,
      process.env.PASSWORD,
    ),
    { disableLosslessIntegers: true }
  );

  driver.session = () => mockSessionFromQuerySet(querySet);
  driver.verifyConnectivity = () => Promise.resolve({});
  driver.supportsMultiDb = () => Promise.resolve(true);
  driver.supportsTransactionConfig = () => Promise.resolve(true);
  return driver;
}

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

const driver = mockDriver();

function context({ event, context }: { event: any, context: any }): any {
  return ({
    event,
    context,
    driver,
    user,
    cypherParams,
  });
}

const server = new ApolloServer(
  {
    schema,
    context,
    cors: {
      origin: '*',
      methods: 'GET,HEAD,POST',
    },
    introspection: true,
  });

const MOVIES = `
query GetMovies($title: String!){
  getMovies(title: $title){
   title
   #released
  }
}
`;

test('SSS [spoof simple server]', async (t: any) => {
  const result = await server.executeOperation({
    query: MOVIES,
    variables: movieParams,
  });
  console.log(`result=${JSON.stringify(result)}`);
  // console.log(`movieOutput.records=${JSON.stringify(movieOutput.records)}`);
  // console.log(`mockResultsFromCapturedOutput(movieOutput).records=${JSON.stringify(mockResultsFromCapturedOutput(movieOutput).records)}`);
  t.true(!result.errors);

  t.deepEqual(
    // @ts-ignore
    result.data.getMovies,
    mockResultsFromCapturedOutput(movieOutputWithoutReleased)
      .records.map(record=> record.get('movie').properties)
  );
});
