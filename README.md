
[//]: # ( ns__file unit: standard, comp: README.md )

[//]: # ( ns__custom_start beginning )

[//]: # ( ns__custom_end beginning )

[//]: # ( ns__start_section intro )

[//]: # ( ns__custom_start description )

![](images/neo-forgery.gif)

the easy way to mock a neo4j-driver session.

[//]: # ( ns__custom_end description )

[//]: # ( ns__custom_start afterDescription )

[//]: # ( ns__custom_end afterDescription )

[//]: # ( ns__custom_start badges )

[//]: # ( ns__start_section usageSection )

[![codecov](https://codecov.io/gh/YizYah/neo-forgery/branch/main/graph/badge.svg?token=019QO4XK1Z)](https://codecov.io/gh/YizYah/neo-forgery)
[![Version](https://img.shields.io/npm/v/neo-forgery.svg)](https://npmjs.org/package/neo-forgery)
[![Downloads/week](https://img.shields.io/npm/dw/neo-forgery.svg)](https://npmjs.org/package/neo-forgery)
[![License](https://img.shields.io/npm/l/neo-forgery.svg)](https://github.com/YizYah/neo-forgery/blob/master/package.json)

[![Geenee](https://img.shields.io/badge/maintained%20by-geenee-brightgreen)](https://npmjs.org/package/geenee)
[![Template](https://img.shields.io/badge/template-ts--packrat-blue)](https://npmjs.org/package/ts-packrat)

[//]: # ( ns__custom_end badges )

[//]: # ( ns__end_section intro )


[//]: # ( ns__start_section api )


[//]: # ( ns__custom_start APIIntro )

[//]: # ( ns__custom_start toc )
<!-- toc -->
* [:clipboard: Why](#clipboard-why)
* [:white_check_mark: What](#white_check_mark-what)
* [:wrench: Usage](#wrench-usage)
* [:key:Functions](#key-functions)
* [:paperclip: Data Types](#paperclip-data-types)
* [:heavy_exclamation_mark: Limits](#heavy_exclamation_mark-limits)
* [:blue_book: Tutorial](#blue_book-tutorial)
* [:thumbsup: Credits](#thumbsup-credits)
<!-- tocstop -->

[//]: # ( ns__custom_end toc )

# <a name="clipboard-why"></a>:clipboard: Why
I couldn't find any other straightforward way to mock the neo4j driver during unit tests. It needs to be super fast and simple to work with CI and TDD.

# <a name="white_check_mark-what"></a>:white_check_mark: What
A mock session generator for neo4j.  You set up a mock neo4j session by specifying an array of query spec objects.  Each query spec object contains a query string, param set, and expected response.

You can then pass in your session as a parameter to a function to test instead of a real session. It works for both running queries directly (`session.run(...)`) and transactions (`session.readTransaction()` and `session.writeTransaction()`). You also can generate a mock driver, build your server using it rather than the real driver, and mock all of the queries in the server.

And there's a function to test a query set against the live database, not intended for unit tests.  That way, whenever you change your database you can confirm that the queries in your mock session are all still working!

# <a name="wrench-usage"></a>:wrench: Usage

Include the package in `dev`:
```
npm i -D neo-forgery
```

### Mocking a Query
To mock a query, simply:
1. capture the result from the query. For instance, if you call the query in your code already with a `console.log` statement:
     ```
        (result: any) => {
           console.log(`result=${JSON.stringify(result)}`)
           ...
        }
     ```

     Or you can run the query in the neo4j data browser, then on the left click the `Code` button and copy the `Response`:.

    ![response](images/gettingResponse.jpg)

    __*NOTE*__ If you copy from the data browser, you'll only get the `records` portion of the output.  You'll have to paste it in as a value for `records`  in an object:
    ```
    {
        records: <Response>
    }
    ```

2. copy and store the output as a const, e.g.:
    ```
    const sampleOutput = {
      'records': [{ ... } ... ]
    }
    ```
3. Currently, you must manually replace any integers stored as `{ low: <value>, high: 0 }` as `<value>`.  For instance, `{ low: 1994, high: 0 }` must be replaced with `1994`.  We are planning on removing this step shortly.
4. Create an array of `QuerySpec` and insert your query string, params, and output.  Here's an example in TypeScript using the [sample movies database](https://neo4j.com/developer/example-project/#_existing_language_driver_examples).

    ```
    import {QuerySpec, mockSessionFromQuerySet} from 'neo-forgery'
    
    const querySet:QuerySpec[] = [
        {
            name: 'movies',
            query: 'MATCH (movie:Movie)' +
                ' WHERE toLower(movie.title) CONTAINS $query' +
                ' RETURN movie',
            output: expectedResultForMovieQuery,
            params: {query:"matrix"}
        },
        {
            name: 'title',
            query: 'MATCH (movie:Movie {title:$title}) ' +
                'OPTIONAL MATCH (movie)<-[rel]-(person:Person) ' +
                'RETURN movie.title as title, ' +
                'collect({name:person.name, role:rel.roles, job:head(split(toLower(type(rel)),\'_\'))}) as cast ' +
                'LIMIT 1',
            params: {title: 'Apollo 13'},
            output: expectedResultsForTitleQuery,
        }
    ]
    ```

5. generate a mockSession that returns it using `mockSession`.  You can then call `mockResultsFromCapturedOutput` to generate a true neo4j array of the Record type to compare the expected output to what your mock session returns.
    ```
        const session = mockSessionFromQuerySet(querySet)
        const output = await session.run(query, params)
        t.deepEqual(output,mockResultsFromCapturedOutput(expectedOutput))
    ```

You can pass your mock session into code that requires a session.

An alternative to `mockResultsFromCapturedOutput` is `mockResultsFromData`, which takes as input an array of objects containing record values.  That can be useful if you know what data you want, and did not copy the Results from the data browser or from a `console.log` statement.

## <a name="key-functions"></a>:key: Functions
### Mock Results Generation
There are two functions for generating mock output.  These can be used for confirming that output is what you expect it to be.

```
function mockResultsFromCapturedOutput(sampleOutput: MockOutput)
```
You can pass in results from a query as captured by a `console.log` statement, or based on results from the neo4j data browser.

```
mockResultsFromData(sampleResults: object[])
```
You can pass in an array of objects expected and it returns the mock results.


### Mock Session Generation
There are two functions for mock session generations, analogs to the [mock results generation functions above](#mock-results-generation).

```
mockSessionFromQuerySet
```
You pass in a QuerySet and an instance of a neo4j `Session` is returned.

```
mockSessionFromFunction(sessionRunMock: Function)
```
Pass in a Function and a session is generated.

The `sessionRunMock` function shoud take in as parameters (query: string, params: any), and should normally return mock results.  You can use the [mock results generation functions above](#mock-results-generation) for the returned values.  You can also vary the output from the function based upon the query and params received. In theory you could create a session which emulates your entire database for all of the queries in your tests, and simply reuse the mock session in all of your tests.  Note that you can also throw errors if you are testing for them. 

### Mock Driver Generation
There are cases where you will have to generate a mock driver.  The most typical use case is for mocking an Apollo Server that uses the [@neo4j/graphql](https://www.npmjs.com/package/@neo4j/graphql) library.

The following function can be used:
```
mockDriver(session: Session, databaseInfo?: DatabaseInfo)
```
* `session` can be generated using either of the [Mock Session Generation Functions](#mock-session-generation) above.
* You probably don't need to specify anything about a real database.  But if you want the proper info stored for the driver you can generate `databaseInfo` is generate using the utility function [getDatabaseInfo](#getdatabaseinfo), e.g.:
 ```
 const databaseInfo = getDatabaseInfo(
   process.env.URI,
   process.env.USER_NAME,
   process.env.PASSWORD
 )
 ```
You can insert your `driver` into a `context` used with `ApolloServer`, e.g.:
```
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
```
Then you can include calls inside of your session.

__*Note*__: when you use `@cypher` directives, the [@neo4j/graphql](https://www.npmjs.com/package/@neo4j/graphql) library will augment your query text as well as your parameters. So the first time the query will probably fail.  But neo-forgery automatically tells you clearly how you need to change both the queries and the parameters to be able to match. So you can just copy the proper values and replace your own.

Another usage of your driver is overriding `driver` in code that uses one.  You can use [proxyquire](https://www.npmjs.com/package/proxyquire) or whatever tool you'd like to stub out the definition of `driver` in your code and replace it with `mockDriver`.
  
    ```
    const { myUnit } = proxyquire('../src/myUnit', {
      'neo4j-driver': { 'driver': mockDriver },
    });
    ```

### Utilities
Some utilities are planned to make your like simpler.  Currently, there is only `getDatabaseInfo`.

#### getDatabaseInfo
```
export function getDatabaseInfo(
  uri?: string,
  user?: string,
  password?: string,
  database?: string,
)
```
You can insert the information that you need.  Usually you won't need it.

Here's an example usage based upon an `.env` file:
```
require('dotenv').config();
import { getDatabaseInfo } from 'neo-forgery';

const databaseInfo = getDatabaseInfo(
  process.env.URI,
  process.env.USER_NAME,
  process.env.PASSWORD
)
```

### Verification of Your Mock Query Results
One last function is
```
testQuerySet(querySet: QuerySpec[], databaseInfo: DatabaseInfo)
```
See [Checking the Validity of Your Mocked Queries](#checking-the-validity-of-your-mocked-queries) below.

## <a name="paperclip-data-types"></a>:paperclip: Data Types
There are some interfaces that you can import into your TypeScript project.

### Database Specification
You must use a DatabaseInfo type for specifying the database that you want to use for running [testQuerySet](#checking-the-validity-of-your-mocked-queries).
```
interface DatabaseInfo {
  URI: string;
  USER: string;
  PASSWORD: string;
  DATABASE?: string;
}
```

### Query Response Specification 
The output from a query is specified via a `MockOutput` instance:
```
interface MockOutput {
    records: SampleOutputRecord[];
    summary?: any;
}
```
Normally, you won't need to worry about the details for that.  You can just capture the output in the ways specified [above](#mocking-a-query).

### Query Specifications
A query set is an instance of `QuerySpec[]`:
```
export interface QuerySpec {
    name?: string;
    query: string;
    output: MockOutput;
    params?: ParamSet;
}
```

### Checking the Validity of Your Mocked Queries
The `neo-forgery` package is build based on the premise that unit tests must be fast.  By removing the need to query an actual database, you get instant results.  But what if your database changes and the queries no longer work?

To solve that problem, `neo-forgery` exports a function:
```
async function testQuerySet(querySet: QuerySpec[], databaseInfo: DatabaseInfo)
```
You can pass in your set of queries along with the information needed for a database, and you can check whether the queries work for the given database.  If any of them fail to return what you specify as output, and error is returned.

For example:
```
import { DatabaseInfo, testQuerySet } from 'neo-forgery'
const moviesDatabaseInfo: DatabaseInfo = {
  URI: 'neo4j+s://demo.neo4jlabs.com',
  USER: 'movies',
  PASSWORD: 'movies',
  DATABASE: 'movies',
};

const queriesWorking = await testQuerySet(querySet, moviesDatabaseInfo)
t.is(queriesWorking, "success")  
```

This function is *not intended for unit tests*! The whole point of `neo-forgery` is to remove the need to query an actual database when you run your unit tests.  Rather, consider creating a separate test that you call regularly, perhaps as part of a regression test or after you change your database.

__*NOTE*__ Currently, `testQuerySet()` currently checks only `records` in query results, and only makes an exact match.  For instance, it will throw an error even the your `output` for a query is a subset of the data returned.  That is a problem if you want to create small sample outputs for testing purposes.  A future version of `neo-forgery` may remove that limitation by allowing you to specify a type of comparison for a query.




# <a name="heavy_exclamation_mark-limits"></a>:heavy_exclamation_mark: Limits
Some limits to neo-forgery are intentional. There's no testing of data updates, because it should not be relevant to unit tests.  You are not testing the database server, or even the queries themselves.  A query is just a string from the standpoint of your unit, and your unit tests should assume that the response is predictable and unchanging.  An end to end test can confirm that independently.  The most that you might need from the standpoint of unit testing is to confirm that a write query was executed, which you can do with a [sinon spy](https://sinonjs.org/releases/latest/spies/).

But `neo-forgery` is new, and there still are things that it should be able to do that have not yet been implemented.

1. Currently, you can't have more than one result in a given mock session for a given query and parameter combination.  That's limiting, because you might have a sequence that queries for something, changes it, and queries for the new value.  For instance, your unit may check whether someone has a registered email, and if it's not there you may add it and then confirm that it is there and proceed with further steps based on that output. There is a planned implementation fixing that problem.
2. The optional `config` parameter for a `Session.run()` is not supported currently. Much of the config may be irrelevant to unit testing, so that will probably be implemented as needed.

# <a name="blue_book-tutorial"></a>:blue_book: Tutorial
Check out this [tutorial to create a project and test](https://medium.com/neo4j/how-to-mock-neo4j-calls-in-node-7066c52ac468).


# <a name="thumbsup-credits"></a>:thumbsup: Credits
Special thanks goes to some people at [neo4j](https://neo4j.com/) for helping me with this.  

:thumbsup: First and foremost to [Antonio Barcélos](https://github.com/bigmontz) on the [neo4j-driver](https://github.com/neo4j/neo4j-javascript-driver) team for the working solution for mocking a transaction.

:thumbsup: Thanks also to [Darrell Warde](https://github.com/darrellwarde) and [Dan Starns](https://github.com/danstarns) on the [@neo4j/graphql](https://github.com/neo4j/graphql) team for some very helpful advice.

[//]: # ( ns__custom_end APIIntro )

[//]: # ( ns__custom_start constantsIntro )
[//]: # ( ns__custom_end constantsIntro )



[//]: # ( ns__start_section types )


[//]: # ( ns__end_section types )


[//]: # ( ns__end_section api )

