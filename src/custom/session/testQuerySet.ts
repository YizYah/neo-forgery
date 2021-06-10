import {QuerySpec} from "../types/QuerySpec";
import {DatabaseInfo} from "../types/DatabaseInfo";
import {Session} from "neo4j-driver";

const getSession = require('../database/getSession')

export async function testQuerySet(querySet: QuerySpec[], databaseInfo: DatabaseInfo) {
    const session: Session = getSession.getSession(databaseInfo)

    for (let i = 0; i < querySet.length; i++) {
        const querySpec: QuerySpec = querySet[i]
        const {query, params, output, name} = querySpec
        let returnValue: any = []
        // console.log(`running '${query}', params '${params}'`)
        try {
            await session.run(
                query,
                params).then(
                (result: any) => {
                    // console.log(`output from '${query}' is ${JSON.stringify(result)}`)
                    returnValue = result
                }
            )

        } catch (error) {
            throw new Error(`error running query '${name? name : query}': ${error}`)
        }

        if (JSON.stringify(returnValue.records) !== JSON.stringify(output.records)) {
            let queryName = name
            if (!name) queryName = query
            throw new Error(`query '${queryName}' is failing! returned this: ${JSON.stringify(returnValue)}`)
        }
    }
    return 'success'
}
