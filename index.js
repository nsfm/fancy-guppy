'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const port = process.env.PORT || 56700;

const server = express();
const router = express.Router();

server.use(bodyParser.json());
server.set('view engine', 'hbs');

server.listen(port, () => {
  console.log('Listening.', port);
});

const GetStatic = require('fancy-guppy/controllers/get_static.js');
new GetStatic(server);
// We'll also serve our static content here. Anything in the project's `static` dir is assumed to be accessible.
/*
server.get('/a:linkId', (req, res, next) => {
  console.log(req.params);
  res.redirect(301, 'https://google.com');
});

server.get('/f:linkId', (req, res, next) => {
  console.log(req.params);
  res.download('hashedfilename', 'friendly_name.jpg', {
    root: '/storage/guppy',
    lastModified: false,
    dotfiles: 'deny',
    immutable: true
  });
});

server.get('/i:linkId', (req, res, next) => {
  console.log(req.params);
  res.sendFile('hashedfilename', {
    root: '/storage/guppy',
    lastModified: false,
    dotfiles: 'deny',
    immutable: true
  });
});
*/
module.exports = { server };
