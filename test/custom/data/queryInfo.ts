export const query = 'match (movie:Movie) return movie'
export const nonExistentQuery = 'match (m:Video) return m'
export const params = {}
export const nonExistentParams = {
  actor: 'Tom Hanks',
}
export const expectedResult = [
  {
    'keys': [
      'movie',
    ],
    'length': 1,
    '_fields': [
      {
        'identity': {
          'low': 9,
          'high': 0,
        },
        'labels': [
          'Movie',
        ],
        'properties': {
          'name': 'Star Wars: Episode VII',
        },
      },
    ],
    '_fieldLookup': {
      'movie': 0,
    },
  },
  {
    'keys': [
      'movie',
    ],
    'length': 1,
    '_fields': [
      {
        'identity': {
          'low': 11,
          'high': 0,
        },
        'labels': [
          'Movie',
        ],
        'properties': {
          'name': 'Jurassic World',
        },
      },
    ],
    '_fieldLookup': {
      'movie': 0,
    },
  },
  {
    'keys': [
      'movie',
    ],
    'length': 1,
    '_fields': [
      {
        'identity': {
          'low': 12,
          'high': 0,
        },
        'labels': [
          'Movie',
        ],
        'properties': {
          'name': 'The Lion King',
        },
      },
    ],
    '_fieldLookup': {
      'movie': 0,
    },
  },
]
export const secondExpectedResult = [
  {
    'keys': [
      'movie',
    ],
    'length': 1,
    '_fields': [
      {
        'identity': {
          'low': 9,
          'high': 0,
        },
        'labels': [
          'Movie',
        ],
        'properties': {
          'name': 'Star Wars: Episode VII',
        },
      },
    ],
    '_fieldLookup': {
      'movie': 0,
    },
  },
  {
    'keys': [
      'movie',
    ],
    'length': 1,
    '_fields': [
      {
        'identity': {
          'low': 12,
          'high': 0,
        },
        'labels': [
          'Movie',
        ],
        'properties': {
          'name': 'The Lion King',
        },
      },
    ],
    '_fieldLookup': {
      'movie': 0,
    },
  },
]
