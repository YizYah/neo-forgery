import { StoredRecord, StoredResponse } from '../..';

export const wrapCopiedResults = (
  copiedResponse: StoredRecord[],
  copiedSummary?: any
): StoredResponse => {
  return {
    records: copiedResponse,
    summary: copiedSummary || {},
  }
}
