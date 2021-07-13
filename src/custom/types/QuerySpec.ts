import {StoredResponse} from "./StoredResponse";

interface ParamSet {
    [param: string]: any;
}

export interface QuerySpec {
    name?: string;
    query: string;
    output: StoredResponse;
    params?: ParamSet;
}
