export interface ReturnedDataRecord {
    [key: string]: any;
}

interface FieldLookupList {
    [key: string]: number;
}

export interface SampleOutputRecord {
    '_fields': ReturnedDataRecord;
    keys: string[];
    '_fieldLookup': FieldLookupList;
    length?: number;
}
