'use strict';

const { basename } = require('path');
const { readdirSync } = require('fs');

async function importModels(database) {
  // Retrieve each filename except for this one.
  const model_filenames = readdirSync(__dirname).filter(file => {
    return file !== basename(__filename);
  });

  // Load each of the files we found.
  const models = {};
  for (const filename of model_filenames) {
    try {
      const model_details = require(`${__dirname}/${filename}`);
      models[model_details.name] = model_details.schema(database.db, database.DataTypes);
    } catch (err) {
      console.log(`Failed to import model ${filename}: ${err.toString()}`);
    }
  }

  // TODO: Additionally set up relationships.

  // Attach the models to our our database handle.
  database.models = models;

  return models;
}

module.exports = importModels;
