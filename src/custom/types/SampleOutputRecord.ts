interface FieldLookupList {
    [key: string]: number;
}

export interface SampleOutputRecord {
    '_fields': object;
    keys: string[];
    '_fieldLookup': FieldLookupList;
    length?: number;
}
