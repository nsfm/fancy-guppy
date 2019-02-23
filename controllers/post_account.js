'use strict';

const yup = require('yup');
const Endpoint = require('fancy-guppy/endpoint.js');

class PostAccount extends Endpoint {
  constructor(server, database) {
    const config = {
      method: 'post',
      path: '/login',
      scopes: [],
      request_schema: {
        body: yup.object().shape({
          username: yup
            .string()
            .email()
            .required(),
          password: yup.string().required()
        })
      }
    };

    super(server, database, config);
  }

  endpoint(req, res, next) {
    return res.send(req.body.url);
  }
}

module.exports = { controller: PostAccount, priority: 'aall' };
