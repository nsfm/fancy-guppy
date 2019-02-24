'use strict';

const yup = require('yup');
const bcrypt = require('bcrypt');

// The authenticator will be bound to its Endpoint when it's called. Its request_schema will be
// validated in conjunction with any request_schema defined on the Endpoint itself.
const authenticators = {
  none: {
    request_schemas: [],
    middleware: (req, res, next) => {
      this.log.debug('none auth with left beef');
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
            password: yup
              .string()
              .min(6)
              .max(72)
              .required()
          })
        ])
      }
    ],
    middleware: (req, res, next) => {
      this.log.debug('basic auth');
      return next();
    }
  },
  token: {
    request_schemas: [],
    middleware: (req, res, next) => {
      this.log.debug('token auth');
      return next();
    }
  }
};

module.exports = { authenticators };
