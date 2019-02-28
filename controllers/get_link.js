'use strict';

const yup = require('yup');
const generator = require('random-seed');
const Endpoint = require('fancy-guppy/endpoint.js');

class GetLink extends Endpoint {
  constructor(server, database, logger) {
    const config = {
      method: 'get',
      path: '/l/:short_url',
      scopes: [],
      transaction: true,
      authenticator: 'none',
      request_schemas: []
    };

    super(server, database, logger, config);
    this.log = logger.child(__filename);
  }

  async endpoint(req, res, next, transaction) {
    const link = await this.models.Link.findOne({ where: { short_url: req.params.short_url } });

    if (!link) return res.status(404).render('404');

    // Provide the link ID in the response header.
    res.set({
      link_id: link.id
    });

    // Return a 302 redirect to the target url.
    return res.redirect(link.target_url);
  }
}

module.exports = { controller: GetLink, priority: 'aayx' };
