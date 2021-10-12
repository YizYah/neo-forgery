import test from 'ava'

const mockSessionFromQuerySet = require("../../src/custom/session/mockSessionFromQuerySet")
import { QuerySpec } from "../../src/custom/types/QuerySpec";
import { storedToLive } from '../../src/custom/response/storedToLive';
import { StoredResponse } from '../../src/custom/types/StoredResponse';
import { stripUpdates } from './data/stripUpdates';
// import {mockResultsFromCapturedOutput} from "../../src/custom/response/mockResultsFromCapturedOutput";

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
const query = 'foo'
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
        query: 'foobaroo',
        params: { x: 'y' },
        output: expectedOutput,
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
    t.deepEqual(stripUpdates(output), stripUpdates(storedToLive(expectedOutput)))
})

test('mockSessionFromQuerySet returns correct output even with extra params', async t => {
    const session = mockSessionFromQuerySet(querySet)
    const output = await session.run(query, { 'boo': 'bar', 'extra': 'should be ignored' })
    t.like(stripUpdates(output), stripUpdates(storedToLive(expectedOutput)))
})

test('mockSessionFromQuerySet extra white space', async t => {
    const session = mockSessionFromQuerySet(querySet)
    const output = await session.run(lessWhiteSpace, { 'boo': 'bar', 'extra': 'should be ignored' })
    t.like(stripUpdates(output), stripUpdates(storedToLive(expectedOutput)))
})


test('mockSessionFromQuerySet takes no params', async t => {
    const session = mockSessionFromQuerySet(querySet)
    const output = await session.run(noParamsQuery)
    t.like(stripUpdates(output), stripUpdates(storedToLive(expectedOutput2)) )
    // t.like(output, storedToLive(expectedOutput2))
})


test('mockSessionFromQuerySet returns error with false input', async (t) => {
    const session = mockSessionFromQuerySet(querySet)

    const error = await t.throwsAsync(async () => {
        const output = await session.run(query, ['bar', 'baz'])
    });
    // t.regex(error.message, /does not contain the given query and params/);
    t.regex(error.message, /your params were not matched./);
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
        const output = await session.run(query, longParams)
    });
    // t.regex(error.message, /does not contain the given query and params/);
    t.regex(error.message, /to treat with contempt or ridicule/);
    t.regex(error.message, /\.\.\./);
})
