import { StoredResponse } from '../../../../src';

export const readQuery = `MATCH (p:Person)
                      WHERE p.name = $personName
                      RETURN p.name AS name`;

export const readParams = {
  personName: 'Alice',
};

export const readResult: StoredResponse = {
  records: [
      {
        "keys": [
          "name"
        ],
        "length": 1,
        "_fields": [
          "Alice"
        ],
        "_fieldLookup": {
          "name": 0
        }
      }
    ],
  summary: {
    'query': {
      'text': 'MATCH (p:Person)\n                      WHERE p.name = $personName\n                      RETURN p.name AS name',
      'parameters': { 'personName': 'Alice' },
    },
    'queryType': 'r',
    'counters': {
      '_stats': {
        'nodesCreated': 0,
        'nodesDeleted': 0,
        'relationshipsCreated': 0,
        'relationshipsDeleted': 0,
        'propertiesSet': 0,
        'labelsAdded': 0,
        'labelsRemoved': 0,
        'indexesAdded': 0,
        'indexesRemoved': 0,
        'constraintsAdded': 0,
        'constraintsRemoved': 0,
      }, '_systemUpdates': 0,
    },
    'updateStatistics': {
      '_stats': {
        'nodesCreated': 0,
        'nodesDeleted': 0,
        'relationshipsCreated': 0,
        'relationshipsDeleted': 0,
        'propertiesSet': 0,
        'labelsAdded': 0,
        'labelsRemoved': 0,
        'indexesAdded': 0,
        'indexesRemoved': 0,
        'constraintsAdded': 0,
        'constraintsRemoved': 0,
      }, '_systemUpdates': 0,
    },
    'plan': false,
    'profile': false,
    'notifications': [],
    'server': { 'address': '8e153e87.databases.neo4j.io:7687', 'version': 'Neo4j/4.2-aura', 'protocolVersion': 4.2 },
    'resultConsumedAfter': { 'low': 2, 'high': 0 },
    'resultAvailableAfter': { 'low': 46, 'high': 0 },
    'database': { 'name': 'neo4j' },
  },
};
