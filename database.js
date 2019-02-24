'use strict';

const Sequelize = require('sequelize');

class Database {
  constructor(config = {}, models = {}) {
    this.config = {
      sequelize: {},
      logger: undefined
    };
    Object.assign(this.config, config);

    this.sequelize = new Sequelize(config.sequelize);
    this.DataTypes = Sequelize;
    this.models = {};
    this.log = this.logger ? this.logger.child(__filename) : console;

    this.importModels(models);
  }

  importModels(models = {}) {
    for (const name in models) {
      try {
        this.models[name] = models[name](this.sequelize, this.DataTypes);
        this.log.debug(`Imported model: ${name}`);
      } catch (err) {
        this.log.error(err, `Failed to import model: ${name}`);
      }
    }
  }
}

module.exports = Database;
