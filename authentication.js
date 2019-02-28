'use strict';

const yup = require('yup');
const bcrypt = require('bcrypt');
const moment = require('moment');
const { createHmac, timingSafeEqual } = require('crypto');
const log = require('fancy-guppy/logging.js').child(__filename);

// TODO Pull together JWT signing/parsing resources.

const signing_key = process.env.SIGNING_KEY;
if (!signing_key) throw new Error('Cannot validate tokens without SIGNING_KEY set.');

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
        body: yup.object().shape({
          password: yup
            .string()
            .min(6)
            .max(72)
            .required(),
          username: yup
            .string()
            .trim()
            .lowercase()
            .min(3)
            .max(36)
            .matches(/^(?=.{3,36}$)[a-z0-9\_\-\#\@\.\$\!\^\?\{\}\~\|\[\]]+$/),
          email: yup.string().email()
        })
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
    request_schemas: [
      {
        headers: yup.object().shape({
          authorization: yup
            .string()
            .required()
            .matches(/^Bearer [a-zA-Z0-9\%]+?\.[a-zA-Z0-9\%]+?\.([a-zA-Z0-9\%]+)?$/)
        })
      }
    ],
    middleware: async function(req, res, next) {
      try {
        const [header, payload, signature] = req.headers.authorization.split(' ')[1].split('.');

        const jwt = {
          header,
          payload,
          signature
        };

        // Decode each field in the JWT. Leave the values as buffers.
        for (const field in jwt) {
          jwt[field] = decodeURIComponent(jwt[field]);
          jwt[field] = Buffer.from(jwt[field], 'base64');
        }

        // Create an authentic signature for comparison with the suspect one.
        const authentic_signature = createHmac('sha256', signing_key)
          .update(jwt.header.toString() + jwt.payload.toString())
          .digest('hex');

        if (!timingSafeEqual(jwt.signature, Buffer.from(authentic_signature))) throw new Error('Invalid signature.');

        // Parse and validate the payload. Check the basic timestamp validities.
        jwt.payload = JSON.parse(jwt.payload.toString());
        const current_time = moment();
        const token_schema = yup.object().shape({
          iat: yup
            .number()
            .integer()
            .required()
            .lessThan(current_time.unix()),
          nbf: yup
            .number()
            .integer()
            .required()
            .lessThan(current_time.unix()),
          exp: yup
            .number()
            .integer()
            .required()
            .moreThan(current_time.unix()),
          id: yup.string(), // TODO uuidv4 regex
          jti: yup.string(),
          scopes: yup
            .number()
            .integer()
            .required()
        });

        // Will throw if the token didn't validate.
        await token_schema.validate(jwt.payload);

        // Fetch the token so we can ensure that it hasn't been revoked.
        const [token, account] = await Promise.all([
          this.models.Token.findOne({ where: { id: jwt.payload.jti } }),
          this.models.Account.findOne({ where: { id: jwt.payload.id } })
        ]);

        if (token.revoked) throw new Error('Token was revoked.');

        // Attach the account to the request in case we need it again.
        req.data = {
          account
        };
      } catch (err) {
        return next(err);
      }
      return next();
    }
  }
};

module.exports = { authenticators };
