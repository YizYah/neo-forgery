import {storedRecordToData} from "./storedRecordToData";
import { StoredRecord } from '../..';

export function storedRecordsToData(records: StoredRecord[]): object[] {
    return records.map(record => storedRecordToData(record))
}
