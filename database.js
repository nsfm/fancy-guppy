'use strict';

const Sequelize = require('sequelize');

class Database {
  constructor(database_config = {}, models = {}) {
    this.sequelize = new Sequelize(database_config);
    this.DataTypes = Sequelize;
    this.models = models;
  }
}

module.exports = Database;
