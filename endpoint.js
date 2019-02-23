'use strict';

class Endpoint {
  endpoint(req, res, next) {
    return res.json({});
  }

  authenticate(req, res, next) {
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

  constructor(server, config) {
    this.server = server;

    // Default configuration values.
    this.method = 'get';
    this.path = '';
    this.scopes = [];
    this.request_schema = {}; // A map of fields in `req` to Yup schemas.

    // Copy the config into this instance.
    Object.assign(this, config);

    // If any scopes were defined we'll need to authenticate and see which scopes the token holder has.
    if (this.scopes.length > 0) this.server.use(this.path, this.authenticate.bind(this));
    // If the endpoint accepts input, validate those fields.
    if (Object.keys(this.request_schema).length > 0) this.server.use(this.path, this.validate.bind(this));
    // Set up the route and bind our endpoint.
    this.server[this.method](this.path, this.endpoint.bind(this));
  }

  toString() {
    return `${this.method} ${this.path} (${this.scopes})`;
  }
}

module.exports = Endpoint;
