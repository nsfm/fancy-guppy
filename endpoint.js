'use strict';

class Endpoint {
  endpoint(req, res, next) {
    return res.json({});
  }

  authenticate(req, res, next) {
    // Check for a JWT in the header.

    console.log('Authenticate: ', this.scopes);
    next();
  }

  constructor(server, config) {
    const { method = 'get', path = 'default', priority = 'zzzz', scopes = [] } = config;

    // Copy the config into this instance.
    Object.assign(this, config);

    console.log(`Setting up new route: ${this.method}, ${this.path}`);

    // Set up the endpoint.
    server[method](path, this.endpoint.bind(this));

    // If any scopes were defined we'll need to authenticate and see which scopes the token holder has.
    if (scopes.length > 0) server.use(this.path, this.authenticate.bind(this));
  }
}

module.exports = Endpoint;
