/*
  This test is lifted from the connectivity test shown in the Aura console.

  To run this test, you must create a .env file (use .env.sample as a model)
  with a valid set of database credentials.
 */

import test from 'ava';
import {readQuery, readParams} from "../data/queries/readQuery";
import {writeParams, writeQuery} from "../data/queries/writeQuery";

require('dotenv').config()

test('check connectivity', async (t) => {
  const neo4j = require('neo4j-driver')

  const uri = process.env.URI;
  const user = process.env.USER_NAME
  const password = process.env.PASSWORD

  const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))
  const session = driver.session()

  try {
    // To learn more about the Cypher syntax, see https://neo4j.com/docs/cypher-manual/current/
    // The Reference Card is also a good resource for keywords https://neo4j.com/docs/cypher-refcard/current/

    // Write transactions allow the driver to handle retries and transient errors
    const writeResult = await session.writeTransaction((tx: any) =>
      tx.run(writeQuery, writeParams)
    )
    writeResult.records.forEach((record: any)  => {
      const person1Node = record.get('p1')
      const person2Node = record.get('p2')
      t.is(person1Node.properties.name, 'Alice')
      t.is(person2Node.properties.name, 'David')
      console.log(
        `Created friendship between: ${person1Node.properties.name}, ${person2Node.properties.name}`
      )
    })

    const readResult = await session.readTransaction((tx: any) =>
      tx.run(readQuery, readParams)
    )
    readResult.records.forEach((record: any) => {
      console.log(`Found person: ${record.get('name')}`)
      t.is(record.get('name'), 'Alice')

    })
  } catch (error) {
    console.error('Something went wrong: ', error)
  } finally {
    await session.close()
  }

  // Don't forget to close the driver connection when you're finished with it
  await driver.close()
});
