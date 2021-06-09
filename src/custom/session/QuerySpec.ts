import {MockOutput} from "../results/MockOutput";

interface ParamSet {
    [param: string]: any;
}

export interface QuerySpec {
    query: string;
    output: MockOutput;
    params?: ParamSet;
}
