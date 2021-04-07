/* ns__file unit: standard, comp: test/index.test.ts */
/* ns__start_section imports */
import test from 'ava';
/* ns__custom_start customImports */
/* ns__custom_end customImports */

const output = require('../src/index')
/* ns__end_section imports */

/* ns__custom_start general */
test('general', t => {
  // replace with whatever you'd like.  To start over with the default, remove everything including the
  t.not(typeof output, "undefined")
});
/* ns__custom_end general */
