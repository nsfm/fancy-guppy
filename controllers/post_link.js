'use strict';

const yup = require('yup');
const generator = require('random-seed');
const Endpoint = require('fancy-guppy/endpoint.js');

class PostLink extends Endpoint {
  constructor(server, database, logger) {
    const config = {
      method: 'post',
      path: '/links',
      scopes: [],
      transaction: true,
      authenticator: 'token',
      request_schemas: [
        {
          body: yup.object().shape({
            url: yup
              .string()
              .url()
              .required()
          })
        }
      ]
    };

    super(server, database, logger, config);
    this.log = logger.child(__filename);

    this.url_generators = {
      short_alpha: url => {
        // Seed the RNG with the url for predictable shortenings.
        const random = generator.create(url);
        const characters = 'abcdefghijklmnopqrstuvwxyz1234567890';
        const length = 8;
        let string = '';
        for (let i = 0; i < 8; i++) {
          string += characters[random.range(characters.length - 1)];
        }
        return string;
      }
    };
  }

  async endpoint(req, res, next, transaction) {
    const link = await this.models.Link.findOrCreate({
      where: { target_url: req.body.url },
      transaction,
      defaults: {
        account: req.data.account.id,
        short_url: this.url_generators.short_alpha(req.body.url),
        target_url: req.body.url,
        deactivated: false,
        enable_at: null,
        expires_at: null
      }
    });

    return res.json({ link });
  }
}

module.exports = { controller: PostLink, priority: 'aaxx' };
