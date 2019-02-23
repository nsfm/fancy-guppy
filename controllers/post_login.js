'use strict';

const yup = require('yup');
const Endpoint = require('fancy-guppy/endpoint.js');

class PostLogin extends Endpoint {
  constructor(server) {
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

    super(server, config);
  }

  endpoint(req, res, next) {
    return res.send(req.body.url);
  }
}

module.exports = { controller: PostLogin, priority: 'aamm' };
