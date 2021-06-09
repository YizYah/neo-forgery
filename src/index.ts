/* ns__file unit: standard, comp: src/index.ts */
/* ns__custom_start beginning */



/* ns__custom_end beginning */

/* types */

/* ns__custom_start export */
export * from './custom/types/DatabaseInfo'
export * from './custom/types/QuerySpec'
export * from './custom/types/MockOutput'
export * from './custom/types/ReturnedDataRecord'

export const mockSessionFromQuerySet = require('./custom/session/mockSessionFromQuerySet')
export const mockSessionFromFunction = require('./custom/session/mockSessionFromFunction')
export const {testQuerySet} = require('./custom/session/testQuerySet')
/* ns__custom_end export */
