import {MockOutput} from "./MockOutput";

interface ParamSet {
    [param: string]: any;
}

export interface QuerySpec {
    name?: string;
    query: string;
    output: MockOutput;
    params?: ParamSet;
}
