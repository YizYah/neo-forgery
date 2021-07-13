interface FieldLookupList {
    [key: string]: number;
}

// export interface FieldsObject {
//     labels: string[];
//     properties: object;
//     identity: {
//         low: number;
//         high: number;
//     };
// }

export interface StoredRecord {
    _fields: (object|string)[];
    // '_fields': FieldsObject[];
    keys: string[];
    '_fieldLookup': FieldLookupList;
    length?: number;
}
