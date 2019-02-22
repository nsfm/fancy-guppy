'use strict';

const Endpoint = require('fancy-guppy/endpoint.js');

class PostLink extends Endpoint {
  constructor(server) {
    this.config = {
      method: 'get',
      path: '/',
      priority: 'aaaa',
      scopes: []
    };

    this.super(server, this.config);
  }

  endpoint(req, res, next) {
    return res.render('index.hbs', { page_title: 'Guppy', content: 'Three Guppies' });

    return res.send(req.body.url);
  }
}

module.exports = PostContent;
