import { Config, Session } from 'neo4j-driver';
import { MockSession } from './MockSession';
import { Runner } from '../transaction/MockTransaction';

// Builds a mock session whose `run` (and transaction `run`) delegate to a user-supplied
// function. The function fully controls what each call returns, exactly as before.
export function mockSessionFromFunction(mockRun: Runner, config?: Config): Session {
  return new MockSession(mockRun, config) as unknown as Session;
}
