// A query runner shared by MockSession and MockTransaction. It takes a query and params
// and returns whatever the session was configured to return (a real `Result` for a query
// set, or the output of a user-supplied function).
export type Runner = (query: string, params?: any) => any;

// A duck-typed stand-in for both explicit (`beginTransaction`) and managed
// (`executeRead`/`executeWrite`) neo4j-driver transactions. It implements only the public
// surface that test code exercises.
export class MockTransaction {
  private _isOpen = true;

  constructor(private readonly runner: Runner) {}

  run(query: string, params?: any): any {
    return this.runner(query, params);
  }

  commit(): Promise<void> {
    this._isOpen = false;
    return Promise.resolve();
  }

  rollback(): Promise<void> {
    this._isOpen = false;
    return Promise.resolve();
  }

  close(): Promise<void> {
    this._isOpen = false;
    return Promise.resolve();
  }

  isOpen(): boolean {
    return this._isOpen;
  }
}
