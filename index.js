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
  async listen() {
    return new Promise((resolve, reject) => {
      this.server.listen(this.port, err => {
        if (err) {
          return reject(err);
        }
        this.log.info('Listening.', { port: this.port, routes: this.router.stack });
        resolve();
      });
    });
  }
}

// If we're starting this application directly from this file, start up a default Fancy Guppy instance.
if (require.main === module) {
  (async () => {
    const { unlinkSync, writeFileSync } = require('fs');
    const Database = require('fancy-guppy/database.js');
    const models = require('fancy-guppy/models');
    const controllers = require('fancy-guppy/controllers');
    const logger = require('fancy-guppy/logging.js');

    const log = logger.child(__filename);

    // Prepare default FancyGuppy configuration values.
    const fancy_config = {
      pid_path: process.env.FANCY_GUPPY_PID_PATH || 'server.pid',
      port: process.env.FANCY_GUPPY_PORT || 56700
    };

    // Overwrite those config settings from a local config file, if available.
    try {
      const given_config = require('fancy-guppy/fancy.json');
      Object.assign(fancy_config.sequelize, given_config);
    } catch (err) {
      log.error({ err }, 'Failed to load Fancy Guppy config from fancy.json');
    }

    // Set up a pidfile.
    try {
      unlinkSync(fancy_config.pid_path);
    } catch (err) {
      // This is fine.
    }

    try {
      writeFileSync(fancy_config.pid_path, process.pid);
    } catch (err) {
      log.error(err, 'Failed to write pid file.');
    }

    // Set up some exit handlers to hopefully remove the pidfile if the process dies.
    const pid_cleanup_events = ['exit', 'SIGINT', 'SIGUSR1', 'SIGUSR2', 'uncaughtException'];
    for (const event of pid_cleanup_events) {
      process.on(event, () => {
        unlinkSync(fancy_config.pid_path);
      });
    }
    // Prepare some default database configuration values.
    const database_config = {
      sequelize: {
        database: process.env.FANCY_GUPPY_DATABASE,
        username: process.env.FANCY_GUPPY_USERNAME,
        password: process.env.FANCY_GUPPY_PASSWORD,
        host: process.env.FANCY_GUPPY_HOST || 'localhost',
        port: process.env.FANCY_GUPPY_DATABASE_PORT || 3306,
        dialect: 'mysql',
        logging: false,
        pool: { max: 5, idle: 30000, acquire: 60000 },
        operatorsAliases: false
      },
      logger
    };

    // Overwrite database config settings from a local file, if available.
    try {
      const given_config = require('fancy-guppy/database.json');
      Object.assign(database_config.sequelize, given_config);
    } catch (err) {
      log.error({ err }, 'Failed to load database config from database.json');
    }

    log.debug('Connecting to database...');
    let database;
    try {
      database = new Database(database_config, models);
    } catch (err) {
      log.error(err, 'Failed to connect to database.');
      process.exit(1);
    }

    // Synchronize our models to the database before we begin.
    try {
      // TODO Proper migrations once the models reach a usable state.
      log.debug('Synchronizing database...');
      await database.sequelize.sync({ force: false });
    } catch (err) {
      log.error(err, 'Failed to synchronize database.');
      process.exit(2);
    }

    const guppy_config = {
      port: fancy_config.port,
      controllers,
      database,
      logger
    };

    const server = new FancyGuppy(guppy_config);

    try {
      await server.listen();
    } catch (err) {
      log.error(err, 'Failed to start server.');
      process.exit(3);
    }
  })();
}

// We'll also export FancyGuppy in case we want to start servers from another module.
module.exports = FancyGuppy;
