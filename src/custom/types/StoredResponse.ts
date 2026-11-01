import {StoredRecord} from "./StoredRecord";

export interface StoredResponse {
    records: StoredRecord[];
    summary?: any;
}

// Alias documented by the Neo4j blog tutorial (issue #47): the captured output of a query
// has the same shape as a StoredResponse.
export type MockOutput = StoredResponse;
