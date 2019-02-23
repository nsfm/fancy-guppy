'use strict';

const yup = require('yup');
const Endpoint = require('fancy-guppy/endpoint.js');

class PostAccount extends Endpoint {
  constructor(server, database) {
    const config = {
      method: 'post',
      path: '/accounts',
      scopes: [],
      transaction: true,
      request_schema: {
        body: yup.object().shape({
          email: yup
            .string()
            .email()
            .required(),
          password: yup.string().required()
        })
      }
    };

    super(server, database, config);
  }

  async endpoint(req, res, next, transaction) {
    // TODO
    const hashed_password = req.password;

    const account = await this.models.Account.create(
      {
        email: req.email,
        password: hashed_password,
        permissions: 0
      },
      { transaction }
    );

    return res.json(account.get({ plain: true }));
  }
}

module.exports = { controller: PostAccount, priority: 'aall' };
