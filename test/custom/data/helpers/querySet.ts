import {QuerySpec} from '../../../../src/custom/types/QuerySpec'
import {readQuery, readParams, readResult} from "../queries/readQuery";
import {writeQuery, writeParams, writeResult} from "../queries/writeQuery";

export const querySet:QuerySpec[] = [
    {
        name: 'write',
        query: writeQuery,
        output: writeResult,
        params: writeParams,
    },
    {
        name: 'read',
        query: readQuery,
        output: readResult,
        params: readParams,
    },

]
