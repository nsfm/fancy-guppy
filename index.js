'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

/**
 *  The Fancy Guppy class pulls together configuration for the various other modules and initializes the request
 *  server.
 */
class FancyGuppy {
  /**
   * Prepares the Express server and router, injects Express plugins, and loads endpoints as routes.
   *
   * @param {object} config Basic configuration values.
   * @param {integer=} config.port The port to host the Fancy Guppy server on. Defaults to 56700.
   * @param {object[]} config.controllers An array of classes extending the Fancy Guppy Endpoint class.
   * @param {string=} config.view_engine The Express rendering engine to use for static templates. Defaults to 'hbs'.
   * @param {object} config.database. An instantiated Fancy Guppy Database.
   * @param {object} config.logger An instantiated Fancy Guppy Logger.
   * @param {boolean=} behind_proxy Defaults to true. When true, respect X-Forwarded-By headers.
   */
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
    this.server.use(cors());
    this.server.set('view engine', 'hbs');
    this.server.disable('x-powered-by');
    if (this.behind_proxy) {
      this.server.set('trust proxy', 'loopback');
    }

    // Load routes from our controllers.
    this.active_routes = [];
    for (const { controller } of this.controllers) {
      const endpoint = new controller(this.server, this.database, this.logger);
      this.active_routes.push(endpoint);
      this.log.debug('Initialized route.', { endpoint: endpoint.toString() });
    }
  }

  /**
   *  Call listen to start the Fancy Guppy server.
   *
   *  @returns {null} Returns nothing.
   */
  listen() {
    this.server.listen(this.port, () => {
      this.log.info('Listening.', { port: this.port, routes: this.router.stack });
    });
  }
}

// If we're starting this application directly from this file, start up a default Fancy Guppy instance.
if (require.main === module) {
  (async () => {
    const Database = require('fancy-guppy/database.js');
    const models = require('fancy-guppy/models');
    const controllers = require('fancy-guppy/controllers');
    const logger = require('fancy-guppy/logging.js');

    const log = logger.child(__filename);

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

    log.debug('Connecting to database...');
    let database;
    try {
      database = new Database(database_config, models);
    } catch (err) {
      log.error(err, 'Failed to connect to database.');
      process.exit(-1);
    }

    // Synchronize our models to the database before we begin.
    try {
      // TODO Proper migrations once the models reach a usable state.
      log.debug('Synchronizing database...');
      await database.sequelize.sync({ force: false });
    } catch (err) {
      log.error(err, 'Failed to synchronize database.');
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
