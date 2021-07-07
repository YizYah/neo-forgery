/* ns__file unit: standard, comp: src/index.ts */
/* ns__custom_start beginning */



/* ns__custom_end beginning */

/* types */

/* ns__custom_start export */
export * from './custom/types/DatabaseInfo'
export * from './custom/types/QuerySpec'
export * from './custom/types/MockOutput'
export * from './custom/types/SampleOutputRecord'

export const mockSessionFromQuerySet = require('./custom/session/mockSessionFromQuerySet')
export const mockSessionFromFunction = require('./custom/session/mockSessionFromFunction')

export const {mockResultsFromCapturedOutput} = require('./custom/results/mockResultsFromCapturedOutput')
export const {mockResultsFromData} = require('./custom/results/mockResultsFromData')

export const {testQuerySet} = require('./custom/session/testQuerySet')
export const {mockDriver} = require('./custom/driver/mockDriver')

// utilities
export const {getDatabaseInfo} = require('./custom/database/getDatabaseInfo')

/* ns__custom_end export */
