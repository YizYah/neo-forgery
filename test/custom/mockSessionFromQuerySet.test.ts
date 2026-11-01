import test from 'ava'

import { mockSessionFromQuerySet } from '../../src'
import { QuerySpec } from "../../src/custom/types/QuerySpec";
import { storedToLive } from '../../src/custom/response/storedToLive';
import { StoredResponse } from '../../src/custom/types/StoredResponse';

const expectedOutput: StoredResponse = {
    records:
        [
            {
                "keys": [
                    "role"
                ],
                "length": 1,
                "_fields": [
                    "Moderator"
                ],
                "_fieldLookup": {
                    "role": 0
                }
            },
            {
                "keys": [
                    "role"
                ],
                "length": 1,
                "_fields": [
                    "customer"
                ],
                "_fieldLookup": {
                    "role": 0
                }
            }
        ]
}
const expectedOutput2 = {
    records:
        [
            {
                "keys": [
                    "frank"
                ],
                "length": 1,
                "_fields": [
                    "whatsUp"
                ],
                "_fieldLookup": {
                    "whatsUp": 0
                }
            },
        ]
}

const expectedOutput3 = {
    records:
        [
            {
                "keys": [
                    "a"
                ],
                "length": 1,
                "_fields": [
                    "aValue"
                ],
                "_fieldLookup": {
                    "a": 0
                }
            },
        ]
}

const query = 'foo'
const query2 = 'foobaroo'
const noParamsQuery = 'noparams'
const whiteSpaceQuery = '  \nwhite  \r   space   '
const lessWhiteSpace = 'white space'
const params = { 'boo': 'bar' }
const querySet: QuerySpec[] = [
    {
        query,
        params,
        output: expectedOutput,
    },
    {
        query: query2,
        params: { x: 'y' },
        output: expectedOutput,
    },
    {
        query: query2,
        output: expectedOutput3,
    },
    {
        query: noParamsQuery,
        output: expectedOutput2,
    },
    {
        query: whiteSpaceQuery,
        output: expectedOutput,
    },
]

test('mockSessionFromQuerySet returns correct output', async t => {
    const session = mockSessionFromQuerySet(querySet)
    const output = await session.run(query, params)
    t.deepEqual(output.records, storedToLive(expectedOutput).records)
})


test('mockSessionFromQuerySet works called with transaction', async t => {
    const session = mockSessionFromQuerySet(querySet)
    // readTransaction is a 5.x alias kept for backward compatibility; it is not on the
    // driver-6 Session type, so we reach it through a cast.
    const output: any = await (session as any).readTransaction((tx: any) =>
        tx.run(query, params))

    t.deepEqual(output.records, storedToLive(expectedOutput).records)
    t.is(output.summary.transactionType, 'READ')
})

test('mockSessionFromQuerySet returns correct output even with extra params', async t => {
    const session = mockSessionFromQuerySet(querySet)
    const output = await session.run(query, { 'boo': 'bar', 'extra': 'should be ignored' })
    t.deepEqual(output.records, storedToLive(expectedOutput).records)
})

test('mockSessionFromQuerySet extra white space', async t => {
    const session = mockSessionFromQuerySet(querySet)
    const output = await session.run(lessWhiteSpace, { 'boo': 'bar', 'extra': 'should be ignored' })
    t.deepEqual(output.records, storedToLive(expectedOutput).records)
})

test('mockSessionFromQuerySet evaluates in order', async t => {
    const session = mockSessionFromQuerySet(querySet)

    // this will match the first query result
    const output = await session.run(query2, { 'x': 'y' })
    t.deepEqual(output.records, storedToLive(expectedOutput).records)

    // this will match the second query result
    const output2 = await session.run(query2, { 'x': 'z' })
    t.deepEqual(output2.records, storedToLive(expectedOutput3).records)

})


test('mockSessionFromQuerySet takes no params', async t => {
    const session = mockSessionFromQuerySet(querySet)
    const output = await session.run(noParamsQuery)
    t.deepEqual(output.records, storedToLive(expectedOutput2).records)
})


test('mockSessionFromQuerySet returns error with false input', async (t) => {
    const session = mockSessionFromQuerySet(querySet)

    const error = await t.throwsAsync(async () => {
        await session.run(query, ['bar', 'baz'] as any)
    });
    t.regex((error as Error).message, /your params were not matched./);
})


test('mockSessionFromQuerySet shortens long params in error', async (t) => {
    const session = mockSessionFromQuerySet(querySet)

    const longParams = {
        'mock': ` : to treat with contempt or ridicule : deride he has been mocked as a mama's boy— C. P. Pierce
2 : to disappoint the hopes of for any government to mock men's hopes with mere words and promises and gestures— D. D. Eisenhower
3 : defy, challenge the unstable, strange new world of subatomic particles that mock all attempts at understanding— Philip Howard
4a : to imitate (someone or something) closely : mimic a mockingbird was mocking a cardinal— Nelson Hayes
b : to mimic in sport or derision followed the old man along the street mocking his gait
`,
        'mock2': ` : to treat with contempt or ridicule : deride he has been mocked as a mama's boy— C. P. Pierce
2 : to disappoint the hopes of for any government to mock men's hopes with mere words and promises and gestures— D. D. Eisenhower
3 : defy, challenge the unstable, strange new world of subatomic particles that mock all attempts at understanding— Philip Howard
4a : to imitate (someone or something) closely : mimic a mockingbird was mocking a cardinal— Nelson Hayes
b : to mimic in sport or derision followed the old man along the street mocking his gait
`,
        'mock3': ` : to treat with contempt or ridicule : deride he has been mocked as a mama's boy— C. P. Pierce
2 : to disappoint the hopes of for any government to mock men's hopes with mere words and promises and gestures— D. D. Eisenhower
3 : defy, challenge the unstable, strange new world of subatomic particles that mock all attempts at understanding— Philip Howard
4a : to imitate (someone or something) closely : mimic a mockingbird was mocking a cardinal— Nelson Hayes
b : to mimic in sport or derision followed the old man along the street mocking his gait
`,
        'mock4': ` : to treat with contempt or ridicule : deride he has been mocked as a mama's boy— C. P. Pierce
2 : to disappoint the hopes of for any government to mock men's hopes with mere words and promises and gestures— D. D. Eisenhower
3 : defy, challenge the unstable, strange new world of subatomic particles that mock all attempts at understanding— Philip Howard
4a : to imitate (someone or something) closely : mimic a mockingbird was mocking a cardinal— Nelson Hayes
b : to mimic in sport or derision followed the old man along the street mocking his gait
`,
        'mock5': ` : to treat with contempt or ridicule : deride he has been mocked as a mama's boy— C. P. Pierce
2 : to disappoint the hopes of for any government to mock men's hopes with mere words and promises and gestures— D. D. Eisenhower
3 : defy, challenge the unstable, strange new world of subatomic particles that mock all attempts at understanding— Philip Howard
4a : to imitate (someone or something) closely : mimic a mockingbird was mocking a cardinal— Nelson Hayes
b : to mimic in sport or derision followed the old man along the street mocking his gait
`,
    }

    const error = await t.throwsAsync(async () => {
        await session.run(query, longParams)
    });
    t.regex((error as Error).message, /to treat with contempt or ridicule/);
    t.regex((error as Error).message, /\.\.\./);
})
