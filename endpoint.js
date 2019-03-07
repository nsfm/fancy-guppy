'use strict';

const { authenticators } = require('fancy-guppy/authentication.js');

/**
 * This class provides a common interface to each endpoint so they can be configured consistently and
 * automatically.
 */
class Endpoint {
  /**
   *  Accepts basic endpoint configuration.
   *
   *  @param {object} server An initialized Express server.
   *  @param {object} database An initialized Sequelize handle.
   *  @param {object} logger An initialized Bunyan handle.
   *  @param {config} config Additional basic configuration options and endpoint-specific parameters.
   */
  constructor(server, database, logger, config) {
    // Make these handles accessible.
    this.server = server;
    this.database = database;
    this.models = database.models;
    this.Op = database.sequelize.Op;
    this.log = logger ? logger.child(__filename) : console;

    // Default configuration values.
    this.method = 'get';
    this.path = '';
    this.scopes = [];
    this.transaction = false;
    this.authenticator = 'none';
    this.request_schemas = []; // An array of maps to fields in the request object to be validated.
    this.upload_middleware = null; // A Multer configuration.

    // Copy the config into this instance.
    Object.assign(this, config);

    // Make sure the authenticator is valid and prepare to validate the request for it.
    if (!(this.authenticator in authenticators)) {
      throw new Error(`Unknown authenticator: ${this.authenticator}`);
    }
    this.request_schemas = this.request_schemas.concat(authenticators[this.authenticator].request_schemas);

    // Set up the route-specific error handleri.
    this.server.use(this.path, this.errorHandler.bind(this));

    // Validate the request.
    if (this.request_schemas.length > 0) {
      this.server.use(this.path, this.validate.bind(this));
    }

    // Authenticate the user.
    if (this.authenticator !== 'none') {
      this.server.use(this.path, authenticators[this.authenticator].middleware.bind(this));
    }

    // Wrap the endpoint in a managed transaction, if requested.
    let wrapped_endpoint = this.endpoint;
    if (this.transaction) {
      wrapped_endpoint = async (req, res, next) => {
        try {
          await this.database.sequelize.transaction(async transaction => {
            return this.endpoint(req, res, next, transaction);
          });
        } catch (err) {
          this.log.error(err, 'Rolled back transaction in endpoint.');
          return next(err);
        }
      };
    }

    // Enable the route and bind our endpoint, including upload middleware if applicable.
    if (typeof this.upload_middleware === 'function') {
      this.server[this.method](this.path, this.upload_middleware, wrapped_endpoint.bind(this));
    } else {
      this.server[this.method](this.path, wrapped_endpoint.bind(this));
    }
  }

  /**
   * A placeholder endpoint that does nothing. This method should be extended by the inheriting class.
   *
   * @param {object} req Express request.
   * @param {object} res Express response.
   * @param {function} next Express callback.
   * @returns {null} No value.
   */
  async endpoint(req, res, next) {
    return res.json({});
  }

  /**
   * The validate function is provided as an optional middleware. The constructor will install it if
   * at least one request schema is passed. Note that authentication middleware may contribute request
   * schemas of their own if used, so a custom extension should take these into account.
   *
   * @param {object} req Express request.
   * @param {object} res Express response.
   * @param {function} next Express callback.
   * @returns {null} No value.
   */
  async validate(req, res, next) {
    try {
      for (const request_schema of this.request_schemas) {
        for (const field in request_schema) {
          // Perform the validation and some sanitization.
          const results = await request_schema[field].validate(req[field], {
            strict: false,
            abortEarly: false,
            recursive: true
          });
          // Merge the results of the sanitization into the request field.
          Object.assign(req[field], results);
        }
      }
    } catch (err) {
      this.log.debug(err);
      return res.status(400).json({ code: err.name, errors: err.errors });
    }

    return next();
  }

  /**
   * A default error handler to catch exceptions thrown by this Endpoint's middleware.
   *
   * @param {error} err Error object.
   * @param {object} req Express request.
   * @param {object} res Express response.
   * @param {function} next Express callback.
   * @returns {null} No value.
   */
  async errorHandler(err, req, res, next) {
    this.log.warn(err, 'Error in route.', { path: req.path, ip: req.ip, hostname: req.hostname });
    return res.status(400).json({ err });
  }

  /**
   * Override toString for more pleasant logging.
   *
   * @returns {string} No value.
   */
  toString() {
    return JSON.stringify({ method: this.method, path: this.path, scopes: this.scopes });
  }
}

module.exports = Endpoint;
