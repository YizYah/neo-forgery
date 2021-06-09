// const temp = require('../../../../node_modules/neo4j-driver/types/driver')
export interface DatabaseInfo {
  URI: string;
  USER: string;
  PASSWORD: string;
  DATABASE?: string;
}
