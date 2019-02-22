'use strict';

const { dirname } = require('path');

const Endpoint = require('fancy-guppy/endpoint.js');

class GetStatic extends Endpoint {
  constructor(server) {
    const config = {
      method: 'get',
      path: '/static/:filename',
      priority: 'aaaa',
      scopes: []
    };

    super(server, config);

    this.static_file_root = dirname(require.resolve('fancy-guppy/static/.anchor'));
  }

  endpoint(req, res, next) {
    console.log(this);
    res.sendFile(req.params.filename, { root: this.static_file_root, dotfiles: 'ignore' }, err => {
      console.log(err);
      res.status(404).render('404', { filename: req.params.filename });
    });
  }
}

module.exports = GetStatic;
