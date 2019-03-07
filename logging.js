'use strict';

const bunyan = require('bunyan');
const bunyan_syslog = require('bunyan-syslog');
const { basename } = require('path');

/**
 *  This class wraps Bunyan in a thin configuration layer to provide a common logging interface for the application.
 *  TODO: This class should probably be inherited by Endpoint and the others.
 */
class Logger {
  /**
   *  Configures and constructs the logger.
   */
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

  /**
   *  Return a child logger for a module to use.
   *
   *  @param {string} filename When this is called, please use the __filename magic variable so logs can be traced to
   *    a specific file.
   *  @returns {object} A Bunyan logger instance.
   */
  child(filename) {
    return this.log.child({ file: basename(filename) });
  }
}

module.exports = new Logger();
