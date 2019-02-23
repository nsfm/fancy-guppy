'use strict';

const Sequelize = require('sequelize');

class Database {
  constructor(config, models) {
    this.database_config = {};

    // Overwrite with given values.
    Object.assign(this.database_config, config);

    this.db = new Sequelize(this.database_config);
    this.DataTypes = Sequelize;
    this.models = {};
  }

  sync() {
    return this.db.sync();
  }
}

module.exports = Database;
