export const storedResponse = {
  records: [
    {
      'keys': [
        'app',
      ],
      'length': 1,
      '_fields': [
        {
          'identity': {
            'low': 4499,
            'high': 0,
          },
          'labels': [
            'App',
            'Exported',
          ],
          'properties': {
            'value': 'value1',
            'id': 'id1',
          },
        },
      ],
      '_fieldLookup': {
        'app': 0,
      },
    },
    {
      'keys': [
        'app',
      ],
      'length': 1,
      '_fields': [
        {
          'identity': {
            'low': 4497,
            'high': 0,
          },
          'labels': [
            'App',
            'Exported',
          ],
          'properties': {
            'value': 'value2',
            'id': 'id2',
          },
        },
      ],
      '_fieldLookup': {
        'app': 0,
      },
    },
    {
      'keys': [
        'app',
      ],
      'length': 1,
      '_fields': [
        {
          'identity': {
            'low': 4496,
            'high': 0,
          },
          'labels': [
            'App',
            'Exported',
          ],
          'properties': {
            'id': 'id3',
            'value': 'value3',
            'owner': 'f5224bcb-12d7-48d3-8943-4fa862afa1ec',
          },
        },
      ],
      '_fieldLookup': {
        'app': 0,
      },
    },
  ],
  summary: {
    'query': {
      'text': 'MATCH (this:Book)\nWHERE this.title = $this_title AND this.author = $this_author\nDETACH DELETE this',
      'parameters': {},
    },
    'queryType': 'w',
    'counters': {
      '_stats': {
        'nodesCreated': 0,
        'nodesDeleted': 1,
        'relationshipsCreated': 0,
        'relationshipsDeleted': 0,
      },
      '_systemUpdates': 1,
    },
    'updateStatistics': {
      '_stats': {
        'nodesCreated': 0,
        'nodesDeleted': 1,
        'relationshipsCreated': 0,
        'relationshipsDeleted': 0,
        'propertiesSet': 0,
      },
      '_systemUpdates': 0,
    },
    'plan': false,
  },
};

export const dataResponse = [
  {
    app: {
      'identity': 4499,
      'labels': [
        'App',
        'Exported',
      ],
      'properties': {
        'value': 'value1',
        'id': 'id1',
      },
    },
  }, {
    app: {
      'identity': 4497,
      'labels': [
        'App',
        'Exported',
      ],
      'properties': {
        'value': 'value2',
        'id': 'id2',
      },
    },
  }, {
    app: {
      'identity': 4496,
      'labels': [
        'App',
        'Exported',
      ],
      'properties': {
        'owner': 'f5224bcb-12d7-48d3-8943-4fa862afa1ec',
        'id': 'id3',
        'value': 'value3',
      },
    },
  },
];


const resultSample2 = [
  {
    'keys': [
      'id',
      'value',
    ],
    'length': 2,
    '_fields': [
      '283bc67c-b1b9-4a57-9377-6823f39b8b5b',
      'Sample for Yisroel',
    ],
    '_fieldLookup': {
      'id': 0,
      'value': 1,
    },
  },
  {
    'keys': [
      'id',
      'value',
    ],
    'length': 2,
    '_fields': [
      'eca6861f-6f9f-4ba1-bee6-3a7904956325',
      'Sample for Yisroel',
    ],
    '_fieldLookup': {
      'id': 0,
      'value': 1,
    },
  },
  {
    'keys': [
      'id',
      'value',
    ],
    'length': 2,
    '_fields': [
      '7603d148-cf5d-4d8c-a6b2-f4dad4c3f69e',
      'Sample for Yisroel',
    ],
    '_fieldLookup': {
      'id': 0,
      'value': 1,
    },
  },
  {
    'keys': [
      'id',
      'value',
    ],
    'length': 2,
    '_fields': [
      'b8aa9e8b-070b-494d-8953-7da50d4da8f8',
      'Sample for Yisroel',
    ],
    '_fieldLookup': {
      'id': 0,
      'value': 1,
    },
  },
];

const dataSample2 = [
  { id: '283bc67c-b1b9-4a57-9377-6823f39b8b5b', value: 'Sample for Yisroel' },
  { id: 'eca6861f-6f9f-4ba1-bee6-3a7904956325', value: 'Sample for Yisroel' },
  { id: '7603d148-cf5d-4d8c-a6b2-f4dad4c3f69e', value: 'Sample for Yisroel' },
];
