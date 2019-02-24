'use strict';

const yup = require('yup');
const Endpoint = require('fancy-guppy/endpoint.js');

class PostToken extends Endpoint {
  constructor(server, database) {
    const config = {
      method: 'post',
      path: '/tokens',
      scopes: [],
      transaction: true,
      authenticator: 'basic',
      request_schemas: []
    };

    super(server, database, config);
  }

  async endpoint(req, res, next, transaction) {
    // Merge the request fields into this blank body to simplify the account lookup.
    const body = {
      email: 'aaa', // TODO Sequelize validation thwarting this.
      username: '',
      password: ''
    };
    Object.assign(body, req.body);

    // Validate the username/email and password combo.
    const account = await this.models.Account.findOne({
      where: { [this.Op]: [{ email: body.email }, { username: body.username }] },
      attributes: ['id', 'permissions', 'password'],
      transaction
    });

    if (account === null) throw new Error('No such user.');

    // Compare the submitted password to the one in our database.

    return res.send(req.body.url);
  }
}

module.exports = { controller: PostToken, priority: 'aabb' };
