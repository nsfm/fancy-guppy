'use strict';

const Endpoint = require('fancy-guppy/endpoint.js');

class PostLink extends Endpoint {
  constructor(server) {
    const config = {
      method: 'post',
      path: '/links',
      scopes: []
    };

    super(server, config);
  }

  endpoint(req, res, next) {
    return res.send(req.body.url);
  }
}

module.exports = { controller: PostLink, priority: 'aaxx' };
