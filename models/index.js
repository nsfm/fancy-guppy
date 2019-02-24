'use strict';

const { basename } = require('path');
const { readdirSync } = require('fs');

// Retrieve each filename except for this one.
const model_filenames = readdirSync(__dirname).filter(file => {
  return file !== basename(__filename);
});

// Require each of the files we found.
const models = {};
for (const filename of model_filenames) {
  try {
    const model = require(`${__dirname}/${filename}`);

    if ('name' in model && 'schema' in model) {
      models[model.name] = model.schema;
    } else {
      throw new Error('Valid models export a `name` and `schema`.');
    }
  } catch (err) {
    console.log(`Could not import ${filename}: ${err.toString()}`);
  }
}

// TODO: Additionally set up relationships.

module.exports = models;
