import { QuerySpec } from '../../../../src/custom/types/QuerySpec';

// general server param constants
export const cypherParams = { 'currentUserId': 'f5224bcb-12d7-48d3-8943-4fa862afa1ec' };

export const auth = {
  'isAuthenticated': false,
  'roles': [],
};


// `

// specific movie query info
export const movieQuery = `
                WITH apoc.cypher.runFirstColumn("match (movie:Movie {title:$title}) return movie", {auth: $auth, cypherParams: $cypherParams, title: $title}, true) as x
                UNWIND x as this
            
RETURN this { .title, .released } AS this
`

export const movieParams = {
  title: "Forrest Gump",
  auth,
  cypherParams,
}
export const movieOutput = {
  records: [
    {
      "keys": [
        "movie"
      ],
      "length": 1,
      "_fields": [
        {
          "identity": {
            "low": 32,
            "high": 0
          },
          "labels": [
            "Movie"
          ],
          "properties": {
            "title": "Forrest Gump",
            "released": {
              "low": 1994,
              "high": 0
            }
          }
        }
      ],
      "_fieldLookup": {
        "movie": 0
      }
    },
  ]
}

export const movieOutputWithoutReleased = {
  records: [
    {
      "keys": [
        "movie"
      ],
      "length": 1,
      "_fields": [
        {
          "identity": {
            "low": 32,
            "high": 0
          },
          "labels": [
            "Movie"
          ],
          "properties": {
            "title": "Forrest Gump",
          }
        }
      ],
      "_fieldLookup": {
        "movie": 0
      }
    },
  ]
}

// const movieQueryWithoutReleased = `

//                 WITH apoc.cypher.runFirstColumn("match (movie:Movie {title:$title}) return movie", {auth: $auth, cypherParams: $cypherParams, title: $title}, true) as x
//                 UNWIND x as this
            
// RETURN this { .title } AS this
// `

const movieQueryWithoutReleased = `WITH apoc.cypher.runFirstColumn("match (movie:Movie {title:$title}) return movie", {auth: $auth, cypherParams: $cypherParams, title: $title}, true) as x
                UNWIND x as this
                WITH this
            

RETURN this { .title } AS this`


import {deletionQueryInfo} from "../../data/deleteBooks";

export const querySet: QuerySpec[] = [
  {
    query: movieQueryWithoutReleased,
    params: movieParams,
    output: movieOutputWithoutReleased,
  },
  {
    query: movieQuery,
    params: movieParams,
    output: movieOutput,
  },
  deletionQueryInfo
]
