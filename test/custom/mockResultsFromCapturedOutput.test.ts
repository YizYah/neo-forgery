import test from 'ava'
import {sampleResult} from "./data/sampleResult";
import { storedToLive } from '../../src/custom/response/storedToLive';

const expectedResultForAppSpec = {
    records: [
        {
            "keys": [
                "app"
            ],
            "length": 1,
            "_fields": [
                {
                    "identity": {
                        "low": 4499,
                        "high": 0
                    },
                    "labels": [
                        "App",
                        "Exported"
                    ],
                    "properties": {
                        "value": "Sample for Yisroel",
                        "id": "283"
                    }
                }
            ],
            "_fieldLookup": {
                "app": 0
            }
        },
        {
            "keys": [
                "app"
            ],
            "length": 1,
            "_fields": [
                {
                    "identity": {
                        "low": 4497,
                        "high": 0
                    },
                    "labels": [
                        "App",
                        "Exported"
                    ],
                    "properties": {
                        "value": "Sample for Yisroel",
                        "id": "eca6861f-6f9f-4ba1-bee6-3a7904956325"
                    }
                }
            ],
            "_fieldLookup": {
                "app": 0
            }
        },
        {
            "keys": [
                "app"
            ],
            "length": 1,
            "_fields": [
                {
                    "identity": {
                        "low": 4496,
                        "high": 0
                    },
                    "labels": [
                        "App",
                        "Exported"
                    ],
                    "properties": {
                        "owner": "f5224bcb-12d7-48d3-8943-4fa862afa1ec",
                        "id": "7603d148-cf5d-4d8c-a6b2-f4dad4c3f69e",
                        "value": "Sample for Yisroel"
                    }
                }
            ],
            "_fieldLookup": {
                "app": 0
            }
        },
        {
            "keys": [
                "app"
            ],
            "length": 1,
            "_fields": [
                {
                    "identity": {
                        "low": 4498,
                        "high": 0
                    },
                    "labels": [
                        "App",
                        "Exported"
                    ],
                    "properties": {
                        "value": "Sample for Yisroel",
                        "id": "b8aa9e8b-070b-494d-8953-7da50d4da8f8"
                    }
                }
            ],
            "_fieldLookup": {
                "app": 0
            }
        }
    ]
}


test('storedToLive mock results', t => {
    const results = storedToLive(sampleResult)
    t.is(results.records[0].get('nodes')['foo'], 'bar')
})

test('storedToLive from AppSpec', t => {
    const results = storedToLive(expectedResultForAppSpec)
    t.is(results.records[0].get('app').properties['id'], '283')
})
