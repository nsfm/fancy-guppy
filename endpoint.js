'use strict';

class Endpoint {
  async endpoint(req, res, next) {
    return res.json({});
  }

  async authenticate(req, res, next) {
    // Check for a JWT in the header.

    console.log('Authenticate: ', this.scopes);
    return next();
  }

  async validate(req, res, next) {
    try {
      for (const field in this.request_schema) {
        req[field] = await this.request_schema[field].validate(req[field], {
          strict: false,
          abortEarly: false,
          stripUnknown: true,
          recursive: true
        });
      }
    } catch (err) {
      return res.status(400).json({ code: err.name, errors: err.errors });
    }

    return next();
  }

  async errorHandler(err, req, res, next) {
    return res.status(400).json({ err });
  }

  constructor(server, database, config) {
    this.server = server;
    this.database = database;
    this.models = database.models;
    this.Op = database.sequelize.Op;

    // Default configuration values.
    this.method = 'get';
    this.path = '';
    this.scopes = [];
    this.transaction = false;
    this.request_schema = {}; // A map of fields in `req` to Yup schemas.

    // Copy the config into this instance.
    Object.assign(this, config);

    // Set up the route-specific error handler.
    this.server.use(this.path, this.errorHandler.bind(this));

    // If any scopes were defined we'll need to authenticate and see which scopes the token holder has.
    if (this.scopes.length > 0) this.server.use(this.path, this.authenticate.bind(this));
    // If the endpoint accepts input, validate those fields.
    if (Object.keys(this.request_schema).length > 0) this.server.use(this.path, this.validate.bind(this));

    // Wrap the endpoint in a managed transaction, if necessary.
    let wrapped_endpoint = this.endpoint;
    if (this.transaction) {
      wrapped_endpoint = async (req, res, next) => {
        try {
          await this.database.sequelize.transaction(async transaction => {
            return this.endpoint(req, res, next, transaction);
          });
        } catch (err) {
          console.log('Rolled back transaction: ' + err.toString());
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
