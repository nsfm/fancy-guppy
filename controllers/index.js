'use strict';

const { basename } = require('path');
const { readdirSync } = require('fs');
const log = require('fancy-guppy/logging.js').child(__filename);

// Retrieve each filename except for this one.
const controller_filenames = readdirSync(__dirname).filter(file => {
  return file !== basename(__filename);
});

// Load each of the files we found.
const controllers = [];
for (const filename of controller_filenames) {
  try {
    const controller = require(`${__dirname}/${filename}`);

    // A valid controller has a 'controller' and a 'priority' field.
    if ('controller' in controller && 'priority' in controller) {
      controllers.push(controller);
    }
  } catch (err) {
    log.error(err, 'Failed to load controller.');
  }
}

// Sort our controller modules by priority and expose them.
controllers.sort((a, b) => {
  const c = a.priority.toLowerCase();
  const d = b.priority.toLowerCase();
  return c > d ? 1 : c < d ? -1 : 0;
});

module.exports = controllers;
