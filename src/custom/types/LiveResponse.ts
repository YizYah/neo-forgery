// import { Record } from 'neo4j-driver';
import { Record } from 'neo4j-driver';

// const Record = require('neo4j-driver').types.Record ;

export interface LiveResponse {
  records: Record[];
  summary?: any;
}
