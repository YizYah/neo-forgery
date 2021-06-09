
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
* [:heavy_exclamation_mark: Limits](#heavy_exclamation_mark-limits)
<!-- tocstop -->

[//]: # ( ns__custom_end toc )

# <a name="clipboard-why"></a>:clipboard: Why
I couldn't find any other straightforward way to mock the neo4j driver during unit tests. It needs to be super fast and simple to work with CI and TDD.

# <a name="white_check_mark-what"></a>:white_check_mark: What
A mock session generator for neo4j.  You set up a mock neo4j session by specifying an array of query spec objects.  Each query spec object contains a query string, param set, and expected response.

You can then pass in your session as a parameter to a function to test instead of a real session.

And there's a function to test a query set against the live database, not intended for unit tests.  That way, whenever you change your database you can confirm that the queries in your mock session are all still working!

# <a name="wrench-usage"></a>:wrench: Usage

Include the package in dev:
```
npm i -D neo-forgery
```

## Mocking a Query
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
```
3. create an array of `QuerySpec` and insert your query string, params, and output.  Here's an example in TypeScript using the [sample movies database](https://neo4j.com/developer/example-project/#_existing_language_driver_examples).

```
import {QuerySpec} from 'neo-forgery'

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

3. generate a mockSession that returns it using `mockSession`.  You can then call `mockResultsFromCapturedOutput` to generate a true neo4j array of the Record type to compare the expected output to what your mock session returns.
```
    const session = mockSessionFromQuerySet(querySet)
    const output = await session.run(query, params)
    t.deepEqual(output,mockResultsFromCapturedOutput(expectedOutput))
```

You can pass your mock session into code that requires a session.

## Checking the Validity of Your Mocked Queries
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

## Exported Data Types
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

# <a name="heavy_exclamation_mark-limits"></a>:heavy_exclamation_mark: Limits
1. This package will not help you to test a section of code where you explicitly declare a session using neo4j-driver.  Rather, it helps when you can pass in a session as a parameter.

  That is a limitation, but arguably it is better style anyway to pass in a session as an argument. Doing so isolates entirely the session and database info from the queries being performed.

2. The optional `config` parameter for a `Session.run()` is not supported currently.

[//]: # ( ns__custom_end APIIntro )

[//]: # ( ns__custom_start constantsIntro )
[//]: # ( ns__custom_end constantsIntro )



[//]: # ( ns__start_section types )


[//]: # ( ns__end_section types )


[//]: # ( ns__end_section api )

