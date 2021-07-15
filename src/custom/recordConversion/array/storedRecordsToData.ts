import {storedRecordToData} from "../single/storedRecordToData";
import { StoredRecord } from '../../../index';

export function storedRecordsToData(records: StoredRecord[]): object[] {
    return records.map(record => storedRecordToData(record))
}
