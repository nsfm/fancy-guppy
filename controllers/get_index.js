'use strict';

const Endpoint = require('fancy-guppy/endpoint.js');

class GetIndex extends Endpoint {
  constructor(server) {
    const config = {
      method: 'get',
      path: '/',
      scopes: []
    };

    super(server, config);
  }

  endpoint(req, res, next) {
    return res.render('index.hbs', { page_title: 'Guppy', content: 'Three Guppies' });

    return res.send(req.body.url);
  }
}

module.exports = {controller: GetIndex, priority: 'aazz'};
