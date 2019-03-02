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
    this.logger = undefined;
    this.behind_proxy = true;

    // Copy the config in and override any conflicting default values.
    Object.assign(this, config);

    // Set up the logger.
    this.log = this.logger ? this.logger.child(__filename) : console;

    // Set up our Express server and router.
    this.server = express();
    this.router = express.Router();

    this.server.use(bodyParser.json());
    this.server.set('view engine', 'hbs');
    this.server.disable('x-powered-by');
    if (this.behind_proxy) this.server.set('trust proxy', 'loopback');

    // Load routes from our controllers.
    this.active_routes = [];
    for (const { controller } of this.controllers) {
      const endpoint = new controller(this.server, this.database, this.logger);
      this.active_routes.push(endpoint);
      this.log.debug('Initialized route.', { endpoint: endpoint.toString() });
    }
  }

  listen() {
    this.server.listen(this.port, () => {
      this.log.info('Listening.', { port: this.port, routes: this.router.stack });
    });
  }
}

// Initialize the server if we're running this file directly.
if (require.main === module) {
  (async () => {
    const Database = require('fancy-guppy/database.js');
    const models = require('fancy-guppy/models');
    const controllers = require('fancy-guppy/controllers');
    const logger = require('fancy-guppy/logging.js');

    this.log = logger.child(__filename);

    const database_config = {
      sequelize: {
        database: 'guppy',
        username: 'guppy',
        password: 'lazy_guppy',
        host: '10.0.0.10',
        dialect: 'mysql',
        port: undefined,
        logging: false,
        pool: { max: 5, idle: 30000, acquire: 60000 },
        operatorsAliases: false
      },
      logger
    };

    this.log.debug('Connecting to database...');
    let database;
    try {
      database = new Database(database_config, models);
    } catch (err) {
      this.log.error(err, 'Failed to connect to database.');
      process.exit(-1);
    }

    // Synchronize our models to the database before we begin.
    try {
      // TODO Proper migrations once the models reach a usable state.
      this.log.debug('Synchronizing database...');
      await database.sequelize.sync({ force: false });
    } catch (err) {
      this.log.error(err, 'Failed to synchronize database.');
      process.exit(-2);
    }

    const guppy_config = {
      port: process.env.PORT || 56700,
      controllers,
      database,
      logger
    };

    const server = new FancyGuppy(guppy_config);
    server.listen();
  })();
}

// We'll also export FancyGuppy in case we want to start servers from another module.
module.exports = FancyGuppy;
