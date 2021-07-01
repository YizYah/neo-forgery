export const writeQuery = `MERGE (p1:Person { name: $person1Name })
                       MERGE (p2:Person { name: $person2Name })
                       MERGE (p1)-[:KNOWS]->(p2)
                       RETURN p1, p2`;

export const writeParams = {
    person1Name: 'Alice',
    person2Name: 'David',
}

export const writeResult = {
    "records": [{
        "keys": ["p1", "p2"],
        "length": 2,
        "_fields": [{
            "identity": {"low": 6999, "high": 0},
            "labels": ["Person"],
            "properties": {"name": "Alice"}
        }, {"identity": {"low": 7000, "high": 0}, "labels": ["Person"], "properties": {"name": "David"}}],
        "_fieldLookup": {"p1": 0, "p2": 1}
    }], "summary": {
        "query": {
            "text": "MERGE (p1:Person { name: $person1Name })\n                       MERGE (p2:Person { name: $person2Name })\n                       MERGE (p1)-[:KNOWS]->(p2)\n                       RETURN p1, p2",
            "parameters": {"person1Name": "Alice", "person2Name": "David"}
        },
        "queryType": "rw",
        "counters": {
            "_stats": {
                "nodesCreated": 2,
                "nodesDeleted": 0,
                "relationshipsCreated": 1,
                "relationshipsDeleted": 0,
                "propertiesSet": 2,
                "labelsAdded": 2,
                "labelsRemoved": 0,
                "indexesAdded": 0,
                "indexesRemoved": 0,
                "constraintsAdded": 0,
                "constraintsRemoved": 0
            }, "_systemUpdates": 0
        },
        "updateStatistics": {
            "_stats": {
                "nodesCreated": 2,
                "nodesDeleted": 0,
                "relationshipsCreated": 1,
                "relationshipsDeleted": 0,
                "propertiesSet": 2,
                "labelsAdded": 2,
                "labelsRemoved": 0,
                "indexesAdded": 0,
                "indexesRemoved": 0,
                "constraintsAdded": 0,
                "constraintsRemoved": 0
            }, "_systemUpdates": 0
        },
        "plan": false,
        "profile": false,
        "notifications": [],
        "server": {
            "address": "8e153e87.databases.neo4j.io:7687",
            "version": "Neo4j/4.2-aura",
            "protocolVersion": 4.2
        },
        "resultConsumedAfter": {"low": 4, "high": 0},
        "resultAvailableAfter": {"low": 51, "high": 0},
        "database": {"name": "neo4j"}
    }
}

export const writeQueryFlawed = `MIRAGE (p1:Person { name: $person1Name })
                       BARRAGE (p2:Person { name: $person2Name })
                       HODGE_PODGE (p1)-[:KNOWS]->(p2)
                       RETURN p1, p2`;
