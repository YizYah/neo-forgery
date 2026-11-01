import { Driver, Session, resultTransformers } from 'neo4j-driver';
import { DatabaseInfo } from '../types/DatabaseInfo';

// A duck-typed stand-in for a neo4j-driver `Driver`. It hands out the provided mock session
// and routes `executeQuery` through it, returning a real `EagerResult`. Only the public
// surface is implemented — there is no real connection behind it.
export class MockDriver {
  constructor(private readonly mockSession: Session) {}

  // The session config is accepted (and ignored) so callers that pass one keep working.
  session(): Session {
    return this.mockSession;
  }

  async executeQuery(query: string, params?: any, config?: any): Promise<any> {
    const result = (this.mockSession as any).run(query, params);
    const transformer =
      config && config.resultTransformer
        ? config.resultTransformer
        : resultTransformers.eagerResultTransformer();
    return transformer(result);
  }

  close(): Promise<void> {
    return Promise.resolve();
  }

  verifyConnectivity(): Promise<any> {
    return Promise.resolve();
  }

  getServerInfo(): Promise<any> {
    return Promise.resolve({});
  }

  verifyAuthentication(): Promise<boolean> {
    return Promise.resolve(true);
  }

  supportsMultiDb(): Promise<boolean> {
    return Promise.resolve(true);
  }

  supportsTransactionConfig(): Promise<boolean> {
    return Promise.resolve(true);
  }

  supportsUserImpersonation(): Promise<boolean> {
    return Promise.resolve(true);
  }

  supportsSessionAuth(): Promise<boolean> {
    return Promise.resolve(true);
  }

  isEncrypted(): boolean {
    return false;
  }

  getNegotiatedProtocolVersion(): Promise<number> {
    return Promise.resolve(5.0);
  }
}

// `databaseInfo` is accepted for backward compatibility; the mock no longer builds a real
// driver, so it is unused.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function mockDriver(session: Session, databaseInfo?: DatabaseInfo): Driver {
  return new MockDriver(session) as unknown as Driver;
}
