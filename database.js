'use strict';

const Sequelize = require('sequelize');

class Database {
  constructor(database_config = {}, models = {}) {
    this.sequelize = new Sequelize(database_config);
    this.DataTypes = Sequelize;
    this.models = {};

    this.importModels(models);
  }

  importModels(models = {}) {
    for (const name in models) {
      try {
        this.models[name] = models[name](this.sequelize, this.DataTypes);
        console.log(`Imported model: ${name}`);
      } catch (err) {
        console.log(`Failed to import model ${name}: ${err.toString()}`);
      }
    }
  }
}

module.exports = Database;
