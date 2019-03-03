'use strict';

const { basename } = require('path');
const { readdirSync } = require('fs');
const log = require('fancy-guppy/logging.js').child(__filename);

// Retrieve each filename except for this one.
const filesystem_filenames = readdirSync(__dirname).filter(file => {
  return file !== basename(__filename);
});

// Load each of the files we found.
module.exports = {};
for (const filename of filesystem_filenames) {
  try {
    const filesystem = require(`${__dirname}/${filename}`);

    // Ignore files that don't provide a name and an API class.
    if ('name' in filesystem && 'api' in filesystem) {
      module.exports[filesystem.name] = filesystem.api;
    }
  } catch (err) {
    log.error(err, 'Failed to load filesystem.');
  }
}
