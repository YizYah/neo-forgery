import {QuerySpec} from "../types/QuerySpec";
import {DatabaseInfo} from "../types/DatabaseInfo";
import {Session} from "neo4j-driver";
import { storedToLive } from '../response/storedToLive';
const deepEqual = require('deep-equal')
const getSession = require('../database/getSession')

export async function testQuerySet(querySet: QuerySpec[], databaseInfo: DatabaseInfo) {
    const session: Session = getSession.getSession(databaseInfo)

    for (let i = 0; i < querySet.length; i++) {
        const querySpec: QuerySpec = querySet[i]
        const {query, params, output, name} = querySpec
        let returnValue: any = []
        try {
            await session.run(
                query,
                params).then(
                (result: any) => {
                    returnValue = result
                }
            )

        } catch (error) {
            throw new Error(`error running query '${
                name? 
                  name : 
                  query
            }': ${error}`)
        }

        if (!deepEqual(returnValue.records, storedToLive(output).records)) {
            let queryName = name
            if (!name) queryName = query
            throw new Error(`query '${queryName}' is failing! returned this: 
---------------------
returned=${JSON.stringify(returnValue.records)}
---------------------
expectedRecords=${JSON.stringify(output.records)}
---------------------
`)
        }
    }
    return 'success'
}
