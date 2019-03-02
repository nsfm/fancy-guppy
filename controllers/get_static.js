'use strict';

const { dirname } = require('path');

const Endpoint = require('fancy-guppy/endpoint.js');

class GetStatic extends Endpoint {
  constructor(server, database, logger) {
    const config = {
      method: 'get',
      path: '/static/:filename',
      scopes: [],
      authenticator: 'none',
      request_schemas: []
    };

    super(server, database, logger, config);
    this.log = logger.child(__filename);

    this.static_file_root = dirname(require.resolve('fancy-guppy/static/.anchor'));
  }

  endpoint(req, res, next) {
    res.sendFile(req.params.filename, { root: this.static_file_root, dotfiles: 'ignore' }, err => {
      this.log.warn(err, 'Failed to access static file.');
      res.status(404).render('404', { filename: req.params.filename });
    });
  }
}

module.exports = { controller: GetStatic, priority: 'aaxz' };
