'use strict';

const yup = require('yup');
const bcrypt = require('bcrypt');
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
          username: yup
            .string()
            .trim()
            .lowercase()
            .min(3)
            .max(36)
            .matches(/^(?=.{3,36}$)[a-z0-9\_\-\#\@\.\$\!\^\?\{\}\~\|\[\]]+$/)
            .required(),
          email: yup
            .string()
            .trim()
            .lowercase()
            .min(6)
            .max(72)
            .email()
            .required(),
          password: yup
            .string()
            .min(6)
            .max(72)
            .required()
        })
      }
    };

    super(server, database, config);
  }

  async endpoint(req, res, next, transaction) {
    const hashed_password = await bcrypt.hash(req.body.password, 10);

    // If no other accounts exist with the same username or email, create a new account.
    const [account, created] = await this.models.Account.findOrCreate({
      where: { [this.Op.or]: [{ email: req.body.email }, { username: req.body.username }] },
      defaults: {
        username: req.body.username,
        email: req.body.email,
        password: hashed_password,
        permissions: 0
      },
      transaction
    });

    if (!created) throw new Error('An account with that username or email already exists.');

    return res.json(account.get({ plain: true }));
  }
}

module.exports = { controller: PostAccount, priority: 'aall' };
