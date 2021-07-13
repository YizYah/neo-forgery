import {StoredRecord} from "./StoredRecord";

export interface StoredResponse {
    records: StoredRecord[];
    summary?: any;
}
