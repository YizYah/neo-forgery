import test from 'ava'
import {driverFromDatabaseInfo} from "../../src/custom/database/driverFromDatabaseInfo";
import { getDatabaseInfo } from '../../src/custom/database/getDatabaseInfo';

test('driverFromDatabaseInfo with real data', t => {
  const fakeUri = 'fakeIt.databases.neo4j.io'
  const result = driverFromDatabaseInfo(
    getDatabaseInfo('neo4j+s://' + fakeUri,'fakeUser', 'fakePassword'))
  t.is(result._meta.address._host, fakeUri)
})

// test('driverFromDatabaseInfo with real data', t => {
//   const fakeUri = 'fakeIt.databases.neo4j.io'
//   const result = driverFromDatabaseInfo(
//     getDatabaseInfo('neo4j+s://' + fakeUri,'fakeUser', 'fakePassword'))
//   console.log(`result=${JSON.stringify(result)}`)
//   t.is(result._meta.address._host, fakeUri)
// })
