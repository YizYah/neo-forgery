import { DatabaseInfo } from '../../index';

export function getDatabaseInfo(
  uri?: string,
  user?: string,
  password?: string,
  database?: string,
): DatabaseInfo {
  const finalUri = uri || 'neo4j+s://fake.databases.neo4j.io';
  const finalUser = user || 'neo4j';
  const finalPassword = password || '1000Fake$!';

  return {
    URI: finalUri,
    USER: finalUser,
    PASSWORD: finalPassword,
    DATABASE: database,
  };
}
