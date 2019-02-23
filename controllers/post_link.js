'use strict';

const Endpoint = require('fancy-guppy/endpoint.js');

class PostLink extends Endpoint {
  constructor(server, database) {
    const config = {
      method: 'post',
      path: '/links',
      scopes: []
    };

    super(server, database, config);
  }

  endpoint(req, res, next) {
    return res.send(req.body.url);
  }
}

module.exports = { controller: PostLink, priority: 'aaxx' };
