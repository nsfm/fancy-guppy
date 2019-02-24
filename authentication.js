'use strict';

const yup = require('yup');
const bcrypt = require('bcrypt');
const log = require('fancy-guppy/logging.js').child(__filename);

// The authenticator will be bound to its Endpoint when it's called. Its request_schema will be
// validated in conjunction with any request_schema defined on the Endpoint itself.
const authenticators = {
  none: {
    request_schemas: [],
    middleware: async function(req, res, next) {
      log.debug('none auth with left beef');
      return next();
    }
  },
  basic: {
    request_schemas: [
      {
        body: yup.mixed().oneOf([
          yup.object().shape({
            username: yup
              .string()
              .trim()
              .lowercase()
              .min(3)
              .max(36)
              .matches(/^(?=.{3,36}$)[a-z0-9\_\-\#\@\.\$\!\^\?\{\}\~\|\[\]]+$/)
              .required(),
            email: yup.string().strip(),
            password: yup
              .string()
              .min(6)
              .max(72)
              .required()
          }),
          yup.object().shape({
            email: yup
              .string()
              .email()
              .required(),
            username: yup.string().strip(),
            password: yup
              .string()
              .min(6)
              .max(72)
              .required()
          })
        ])
      }
    ],
    middleware: async function(req, res, next) {
      try {
        // We allow users to sign in either by email or username.
        let condition;
        if ('username' in req.body) {
          condition = { username: req.body.username };
        } else if ('email' in req.body) {
          condition = { email: req.body.email };
        } else {
          throw new Error('Username or email are required for basic authentication.');
        }

        // Find the appropriate account.
        const account = await this.models.Account.findOne({ where: condition });
        if (!account) throw new Error('No such account.');

        // Compare the password given with the hash on the account.
        const matched = await bcrypt.compare(req.body.password, account.password);
        if (!matched) throw new Error('Incorrect password.');

        // Attach the account to the request in case we need it again.
        req.data = {
          account
        };
      } catch (err) {
        return next(err);
      }
      // Looks good to me, proceed.
      return next();
    }
  },
  token: {
    request_schemas: [],
    middleware: async function(req, res, next) {
      log.debug('token auth');
      return next();
    }
  }
};

module.exports = { authenticators };
