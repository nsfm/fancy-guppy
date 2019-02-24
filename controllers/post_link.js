'use strict';

const Endpoint = require('fancy-guppy/endpoint.js');

class PostLink extends Endpoint {
  constructor(server, database, logger) {
    const config = {
      method: 'post',
      path: '/links',
      scopes: []
    };

    super(server, database, logger, config);
    this.log = logger.child(__filename);
  }

  endpoint(req, res, next) {
    return res.send(req.body.url);
  }
}

module.exports = { controller: PostLink, priority: 'aaxx' };
