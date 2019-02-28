'use strict';

const { authenticators } = require('fancy-guppy/authentication.js');

class Endpoint {
  async endpoint(req, res, next) {
    return res.json({});
  }

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

  async errorHandler(err, req, res, next) {
    this.log.warn(err, 'Error in route.', { path: req.path, ip: req.ip, hostname: req.hostname });
    return res.status(400).json({ err });
  }

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

    // Copy the config into this instance.
    Object.assign(this, config);

    // Make sure the authenticator is valid and prepare to validate the request for it.
    if (!this.authenticator in authenticators) throw new Error(`Unknown authenticator: ${this.authenticator}`);
    this.request_schemas = this.request_schemas.concat(authenticators[this.authenticator].request_schemas);

    // Set up the route-specific error handler.
    this.server.use(this.path, this.errorHandler.bind(this));

    // Validate the request.
    if (this.request_schemas.length > 0) this.server.use(this.path, this.validate.bind(this));

    // Authenticate the user.
    if (this.authenticator !== 'none')
      this.server.use(this.path, authenticators[this.authenticator].middleware.bind(this));

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
          next(err);
        }
      };
    }

    // Enable the route and bind our endpoint.
    this.server[this.method](this.path, wrapped_endpoint.bind(this));
  }

  toString() {
    return `${this.method} ${this.path} (${this.scopes})`;
  }
}

module.exports = Endpoint;
