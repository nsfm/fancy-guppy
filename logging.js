'use strict';

const bunyan = require('bunyan');
const bunyan_syslog = require('bunyan-syslog');
const { basename } = require('path');

class Logger {
  constructor() {
    this.log_level = 'debug';
    this.streams = {
      syslog: [
        {
          level: this.log_level,
          stream: bunyan_syslog.createBunyanStream({
            type: 'sys',
            facility: bunyan_syslog.local0,
            host: 'localhost',
            port: 514
          })
        }
      ],
      stdout: [{ level: this.log_level, stream: process.stdout }]
    };

    this.log = bunyan.createLogger({
      name: 'fancy-guppy',
      streams: this.streams.stdout
    });
  }

  child(filename) {
    return this.log.child({ file: basename(filename) });
  }
}

module.exports = new Logger();
