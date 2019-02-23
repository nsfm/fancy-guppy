'use strict';

const express = require('express');
const bodyParser = require('body-parser');

class FancyGuppy {
  constructor(config) {
    // Default settings.
    this.port = 56700;
    this.controllers = [];
    this.view_engine = 'hbs';

    // Copy the config in and override any conflicting default values.
    Object.assign(this, config);

    // Set up our Express server and router.
    this.server = express();
    this.router = express.Router();

    this.server.use(bodyParser.json());
    this.server.set('view engine', 'hbs');
    this.server.disable('x-powered-by');

    // Load routes from our controllers.
    this.active_routes = [];
    for (const { controller } of this.controllers) {
      this.active_routes.push(new controller(this.server));
    }

    this.active_routes.forEach(route => {
      console.log('Initialized route: ' + route);
    });
  }

  listen() {
    this.server.listen(this.port, () => {
      console.log('Listening.', this.port);
    });
  }
}

// Initialize the server if we're running this file directly.
if (require.main === module) {
  const controllers = require('fancy-guppy/controllers');

  const config = {
    port: process.env.PORT || 56700,
    controllers
  };

  const server = new FancyGuppy(config);
  server.listen();
}

// We'll also export FancyGuppy in case we want to start servers from another module.
module.exports = FancyGuppy;
