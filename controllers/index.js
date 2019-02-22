'use strict';

const { basename } = require('path');
const { readdirSync } = require('fs');

// Retrieve each filename except for this one.
const controller_filenames = readdirSync(__dirname).filter(file => {
  return file !== basename(__filename);
});

// Load each of the files we found.
const controllers = [];
for (const filename of controller_filenames) {
  try {
    const controller = require(`${__dirname}/${filename}`);
  } catch (err) {
    console.log(`Failed to load controller: ${err.toString()}`);
  }

  // A valid controller has a 'controller' and a 'priority' field.
  if ('controller' in controller && 'priority' in controller) {
    controllers.push(controller);
  }
}

// Sort our controller modules by priority and expose them.
controllers.sort((a, b) => {
  a = a.toLowerCase();
  b = b.toLowerCase();
  return a === b ? 0 : a < b ? 1 : -1;
});

module.exports = controllers;
