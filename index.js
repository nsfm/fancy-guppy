'use strict';

const express = require('express');
const bodyParser = require('body-parser');

class FancyGuppy {
  constructor(config) {
    // Default settings.
    this.port = 56700;
    this.controllers = [];
    this.view_engine = 'hbs';
    this.database = undefined;

    // Copy the config in and override any conflicting default values.
    Object.assign(this, config);

    // Set up our Express server and router.
    this.server = express();
    this.router = express.Router();

    this.server.use(bodyParser.json());
    this.server.set('view engine', 'hbs');
    this.server.disable('x-powered-by');

    // Load routes from our controllers.
    this.active_routes = [];
    for (const { controller } of this.controllers) {
      this.active_routes.push(new controller(this.server, this.database));
    }

    this.active_routes.forEach(route => {
      console.log('Initialized route: ' + route);
    });
  }

  listen() {
    this.server.listen(this.port, () => {
      console.log('Listening.', this.port);
    });
  }
}

// Initialize the server if we're running this file directly.
if (require.main === module) {
  (async () => {
    const Database = require('fancy-guppy/database.js');
    const models = require('fancy-guppy/models');
    const controllers = require('fancy-guppy/controllers');

    const database_config = {
      database: 'guppy',
      username: 'guppy',
      password: 'lazy_guppy',
      host: '10.0.0.10',
      dialect: 'mysql',
      port: undefined,
      logging: false,
      pool: { max: 5, idle: 30000, acquire: 60000 },
      operatorsAliases: false
    };

    const database = new Database(database_config, models);

    // Synchronize our models to the database before we begin.
    try {
      console.log('Synchronizing database...');
      await database.sequelize.sync({ force: true });
    } catch (err) {
      console.log('Failed to synchronize database.' + err.toString());
    }

    const guppy_config = {
      port: process.env.PORT || 56700,
      controllers,
      database
    };

    const server = new FancyGuppy(guppy_config);
    server.listen();
  })();
}

// We'll also export FancyGuppy in case we want to start servers from another module.
module.exports = FancyGuppy;
