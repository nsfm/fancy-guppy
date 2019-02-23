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
    const validations = [];
    for (const field in this.request_schema) {
      validations.push(
        this.request_schema[field].validate(req[field], {
          strict: false,
          abortEarly: false,
          stripUnknown: true,
          recursive: true
        })
      );
    }

    try {
      await Promise.all(validations);
    } catch (err) {
      return res.status(400).json({ code: err.name, errors: err.errors });
    }

    return next();
  }

  async _getTransaction(req, res, next) {}

  async _rollbackTransaction(req, res, next) {}

  constructor(server, database, config) {
    this.server = server;
    this.database = database;

    // Default configuration values.
    this.method = 'get';
    this.path = '';
    this.scopes = [];
    this.transaction = false;
    this.request_schema = {}; // A map of fields in `req` to Yup schemas.

    // Copy the config into this instance.
    Object.assign(this, config);

    // If any scopes were defined we'll need to authenticate and see which scopes the token holder has.
    if (this.scopes.length > 0) this.server.use(this.path, this.authenticate.bind(this));
    // If the endpoint accepts input, validate those fields.
    if (Object.keys(this.request_schema).length > 0) this.server.use(this.path, this.validate.bind(this));

    // Wrap the endpoint in a managed transaction, if specified.
    if (this.transaction) {
      this.endpoint = (async (req, res, next) => {
        try {
          await this.database.transaction(async transaction => {
            return this.endpoint(req, res, next, transaction);
          });
        } catch (err) {
          console.log('Rolled back transaction: ' + err.toString());
          throw err;
        }
      }).bind(this);
    }

    // Set up the route and bind our endpoint.
    this.server[this.method](this.path, this.endpoint.bind(this));
  }

  toString() {
    return `${this.method} ${this.path} (${this.scopes})`;
  }
}

module.exports = Endpoint;
