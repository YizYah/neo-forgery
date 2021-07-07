const neo4j = require('neo4j-driver')

const SAMPLE_QUERY = 'match (movies:Movie {title:$title}) return movie'
const SAMPLE_VARS = {
  title: "The Matrix"
}



// code to create a driver
const {mockSessionFromQuerySet} = require('neo-forgery');
function mockDriver() {
  const driver = neo4j.driver(
    process.env.DB_URI,
    neo4j.auth.basic(
      process.env.DB_USER,
      process.env.DB_PASSWORD,
    ),
  )

  driver.session = () => mockSessionFromQuerySet(querySet)
  driver.verifyConnectivity = () => {
    return Promise.resolve({})
  }; // could add the properties address?: string, version?: string, protocolVersion?: number, agent?: string
  driver.supportsMultiDb = () =>
  {
    // console.log('in supportsMultiDb')
    return Promise.resolve(true)
  }; // resolves promise with false if you're targeting 3.x versions
  driver.supportsTransactionConfig = () => Promise.resolve(true);  // resolve promise with false if you're targeting versions older than 3.5 (which is not the case, probably)
  console.log(`in mockDriver creator...driver=${JSON.stringify(driver)}`)

  return driver
}



// Code to create a context
const cypherParams = {"currentUserId": "f5224bcb-12d7-48d3-8943-4fa862afa1ec"}
const user = {
  "id": "f5224bcb-12d7-48d3-8943-4fa862afa1ec",
  "roles": ["customer", "moderator", "exporteduser"]
}

function getMockUpdateContext(driver) {
  return async function context({event, context}) {

    console.log(`cypherParams=${JSON.stringify(cypherParams)}`)
    console.log(`user=${JSON.stringify(user)}`)


    return ({
      event,
      context,
      driver,
      user,
      cypherParams,
    })
  }
}


// code to create a server

function createServer(context) {
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


// using it

const driver = mockDriver()
const context = getMockUpdateContext(driver)
const server = createServer(context)


(async () => {
  const result = await server.executeOperation({
    query: SAMPLE_QUERY,
    variables: SAMPLE_VARS,
  });
  console.log(`result=${JSON.stringify(result)}`)
})()
