'use strict';

const { createHash, createHmac } = require('crypto');
const yup = require('yup');
const moment = require('moment');
const Endpoint = require('fancy-guppy/endpoint.js');

class PostToken extends Endpoint {
  constructor(server, database, logger) {
    const config = {
      method: 'post',
      path: '/tokens',
      scopes: [],
      transaction: true,
      authenticator: 'basic',
      request_schemas: []
    };

    super(server, database, logger, config);
    this.log = logger.child(__filename);

    this.signing_key = process.env.SIGNING_KEY;
    if (!this.signing_key) throw new Error('Cannot issue tokens without SIGNING_KEY set.');
    this.signing_key_hash = createHash('sha256')
      .update(this.signing_key)
      .digest('base64');
  }

  async endpoint(req, res, next, transaction) {
    // TODO: Refresh tokens, proper expiration times.

    // Get the time.
    const current_timestamp = moment();

    // Create a token in the database, mainly so we can issue revocations easily.
    const stored_token = await this.models.Token.create(
      {
        account: req.data.account.id,
        revoked: false,
        signing_key_hash: this.signing_key_hash,
        expires_at: current_timestamp.unix()
      },
      { transaction }
    );

    // Set up the token details.
    const token = {
      header: 'guppy', // We're only going to be signing tokens one way, so no need for a real header.
      payload: JSON.stringify({
        iat: current_timestamp.unix(),
        nbf: current_timestamp.subtract(1, 'minute').unix(),
        exp: current_timestamp.add(1, 'year').unix(),
        id: req.data.account.id, // Fetched by the authentication middleware.
        jti: stored_token.id,
        scopes: req.data.account.permissions
      })
    };

    // Create a signature from the token body.
    token.signature = createHmac('sha256', this.signing_key)
      .update(token.header + JSON.stringify(token.body))
      .digest('hex');

    // Base64 encode each field and join them into the final JWT.
    const jwt = [];
    for (const field in token) {
      jwt.push(Buffer.from(token[field]).toString('base64'));
    }

    return res.json({ token: jwt.join('.') });
  }
}

module.exports = { controller: PostToken, priority: 'aabb' };
