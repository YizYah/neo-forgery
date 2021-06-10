import test from 'ava'

const mockSessionFromQuerySet = require("../../src/custom/session/mockSessionFromQuerySet")
import {QuerySpec} from "../../src/custom/types/QuerySpec";
import {mockResultsFromCapturedOutput} from "../../src/custom/results/mockResultsFromCapturedOutput";

const expectedOutput = {
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
const params = {'boo': 'bar'}
const querySet: QuerySpec[] = [
    {
        query,
        params,
        output: expectedOutput ,
    },
    {
        query: 'foobaroo',
        params: {x: 'y'},
        output: expectedOutput,
    },
    {
        query: noParamsQuery,
        output: expectedOutput2,
    },
]

test('mockSessionFromQuerySet returns correct output', async t => {
    const session = mockSessionFromQuerySet(querySet)
    const output = await session.run(query, params)
    t.deepEqual(output,mockResultsFromCapturedOutput(expectedOutput))
})

test('mockSessionFromQuerySet takes no params', async t => {
    const session = mockSessionFromQuerySet(querySet)
    const output = await session.run(noParamsQuery)
    console.log(`output=${JSON.stringify(output)}`)
    t.deepEqual(output,mockResultsFromCapturedOutput(expectedOutput2))
})


test('mockSessionFromQuerySet returns error with false input', async (t) => {
    const session = mockSessionFromQuerySet(querySet)

    const error = await t.throwsAsync(async () => {
        const output = await session.run(query, ['bar','baz'])
    });
    t.regex(error.message, /does not contain the given query and params/);
})
