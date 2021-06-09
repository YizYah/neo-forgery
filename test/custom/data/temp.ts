export const expectedResult = {
    "records": [{
        "keys": ["movie"],
        "length": 1,
        "_fields": [{
            "identity": {"low": 0, "high": 0},
            "labels": ["Movie"],
            "properties": {
                "louvain": {"low": 5, "high": 0},
                "degree": 8,
                "tagline": "Welcome to the Real World",
                "votes": {"low": 170, "high": 0},
                "title": "The Matrix",
                "released": {"low": 1999, "high": 0}
            }
        }],
        "_fieldLookup": {"movie": 0}
    }, {
        "keys": ["movie"],
        "length": 1,
        "_fields": [{
            "identity": {"low": 9, "high": 0},
            "labels": ["Movie"],
            "properties": {
                "louvain": {"low": 5, "high": 0},
                "degree": 7,
                "tagline": "Free your mind",
                "votes": {"low": 96, "high": 0},
                "title": "The Matrix Reloaded",
                "released": {"low": 2003, "high": 0}
            }
        }],
        "_fieldLookup": {"movie": 0}
    }, {
        "keys": ["movie"],
        "length": 1,
        "_fields": [{
            "identity": {"low": 10, "high": 0},
            "labels": ["Movie"],
            "properties": {
                "louvain": {"low": 5, "high": 0},
                "degree": 7,
                "tagline": "Everything that has a beginning has an end",
                "votes": {"low": 80, "high": 0},
                "title": "The Matrix Revolutions",
                "released": {"low": 2003, "high": 0}
            }
        }],
        "_fieldLookup": {"movie": 0}
    }],
    "summary": {
        "query": {
            "text": "MATCH (movie:Movie)/n WHERE toLower(movie.title) CONTAINS $query/n RETURN movie",
            "parameters": {"query": "matrix"}
        },
        "queryType": "r",
        "counters": {
            "_stats": {
                "nodesCreated": 0,
                "nodesDeleted": 0,
                "relationshipsCreated": 0,
                "relationshipsDeleted": 0,
                "propertiesSet": 0,
                "labelsAdded": 0,
                "labelsRemoved": 0,
                "indexesAdded": 0,
                "indexesRemoved": 0,
                "constraintsAdded": 0,
                "constraintsRemoved": 0
            }, "_systemUpdates": 0
        },
        "updateStatistics": {
            "_stats": {
                "nodesCreated": 0,
                "nodesDeleted": 0,
                "relationshipsCreated": 0,
                "relationshipsDeleted": 0,
                "propertiesSet": 0,
                "labelsAdded": 0,
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
        "server": {"address": "demo.neo4jlabs.com:7687", "version": "Neo4j/4.2.3", "protocolVersion": 4.2},
        "resultConsumedAfter": {"low": 0, "high": 0},
        "resultAvailableAfter": {"low": 0, "high": 0},
        "database": {"name": "movies"}
    }
}
