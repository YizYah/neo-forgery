// import { Record } from 'neo4j-driver-core';
import { Record } from 'neo4j-driver-core';

// const Record = require('neo4j-driver').types.Record ;

export interface LiveResponse {
  records: Record[];
  summary?: any;
}
