import {instanciateCapturedResult} from "../records/instanciateCapturedResult";
import {MockOutput} from "./MockOutput";

export function mockResultsFromCapturedOutput(sampleOutput: MockOutput) {
    const records = instanciateCapturedResult(sampleOutput)
    return {
        records,
        resultsSummary: {}
    }
}
