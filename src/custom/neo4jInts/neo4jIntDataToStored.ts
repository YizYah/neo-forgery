import { TraverseContext } from 'traverse';

export function neo4jIntDataToStored(this: TraverseContext, item: any) {
  if ((typeof item) === 'number') {
    this.update({
      high: 0,
      low: item,
    }, true);
  }
}

