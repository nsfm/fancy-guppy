'use strict';

const { Endpoint, Roles } = require('fancy-guppy');

class PostLink extends Endpoint {
  constructor(server) {
    this.config = {
      method: 'post',
      path: '/links',
      priority: 'aaba',
      scopes: []
    };

    this.super(server, this.config);
  }

  endpoint(req, res, next) {
    return res.send(req.body.url);
  }
}

module.exports = PostContent;
