import { Config } from 'neo4j-driver';
import { MockTransaction, Runner } from '../transaction/MockTransaction';

type TransactionType = 'READ' | 'WRITE';

// Stamps the transaction type onto a result's summary, preserving the backward-compatible
// `summary.transactionType` property that 4.x consumers relied on. The real `ResultSummary`
// is built by the driver, so we annotate it after the managed work function resolves.
function stampTransactionType(result: any, transactionType: TransactionType): void {
  if (
    result &&
    typeof result === 'object' &&
    result.summary &&
    typeof result.summary === 'object'
  ) {
    result.summary.transactionType = transactionType;
  }
}

// A duck-typed stand-in for a neo4j-driver `Session`. It implements only the public API,
// so one implementation works on driver 5.x and 6.x — no private `_beginTransaction` hook
// and no real driver/connection behind it.
export class MockSession {
  constructor(
    private readonly runner: Runner,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private readonly config?: Config,
  ) {}

  run(query: string, params?: any): any {
    return this.runner(query, params);
  }

  beginTransaction(): MockTransaction {
    return new MockTransaction(this.runner);
  }

  async executeRead(work: (tx: MockTransaction) => any): Promise<any> {
    return this.runManaged(work, 'READ');
  }

  async executeWrite(work: (tx: MockTransaction) => any): Promise<any> {
    return this.runManaged(work, 'WRITE');
  }

  // 5.x aliases, kept so existing consumers keep working.
  async readTransaction(work: (tx: MockTransaction) => any): Promise<any> {
    return this.executeRead(work);
  }

  async writeTransaction(work: (tx: MockTransaction) => any): Promise<any> {
    return this.executeWrite(work);
  }

  lastBookmarks(): string[] {
    return [];
  }

  // 5.x compatibility alias (singular form).
  lastBookmark(): string[] {
    return [];
  }

  close(): Promise<void> {
    return Promise.resolve();
  }

  private async runManaged(
    work: (tx: MockTransaction) => any,
    transactionType: TransactionType,
  ): Promise<any> {
    const tx = new MockTransaction(this.runner);
    const result = await work(tx);
    stampTransactionType(result, transactionType);
    return result;
  }
}
