'use strict';

const Endpoint = require('fancy-guppy/endpoint.js');

class GetIndex extends Endpoint {
  constructor(server, database, logger) {
    const config = {
      method: 'get',
      path: '/',
      scopes: []
    };

    super(server, database, logger, config);
    this.log = logger.child(__filename);
  }

  endpoint(req, res, next) {
    return res.render('index.hbs', { page_title: 'Guppy', content: 'Three Guppies' });
  }
}

module.exports = { controller: GetIndex, priority: 'aazz' };
