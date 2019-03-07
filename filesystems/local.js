'use strict';

const fs = require('fs');

const Storage = require('fancy-guppy/storage.js');

// This storage method just places the files straight into a directory accessible to the
// server instance. This isn't really suitable for deploying multiple instances of the
// Fancy Guppy server, but you could potentially use a networked disk, dropbox, or some
// rsync hack to make it sort of work if you really wanted to.
class Local extends Storage {
  constructor(config) {
    if (!config.path) throw new Error('Please provide a filesystem path for local file storage.');
    super();

    this.path = config.path;

    // If there's no trailing slash, we can include one.
    if (this.path[this.path.length - 1] !== '/') this.path += '/';
  }

  async _storeFile(stream) {
    // Pipe the incoming stream to a write stream and return the uuid when it's complete.
    return new Promise((resolve, reject) => {
      const uuid = this._getUUID();
      const write_stream = fs.createWriteStream(this.path + uuid);
      write_stream.on('finish', () => {
        resolve(uuid);
      });
      write_stream.on('error', reject);
      stream.pipe(write_stream);
    });
  }

  async _retrieveFile(uuid) {
    return fs.createReadStream(this.path + uuid);
  }

  async _deleteFile(uuid) {
    return new Promise((resolve, reject) => {
      fs.unlink(this.path + uuid, err => {
        if (err) return reject(err);
        return resolve();
      });
    });
  }

  async _peekFile(uuid) {
    return new Promise((resolve, reject) => {
      // TODO: Not sure what stats I should actually return, so I'll come back once I have
      // a use case.
      fs.stat(this.path + uuid, (err, stats) => {
        if (err) return reject(err);
        return resolve(stats);
      });
    });
  }
}

module.exports = { api: Local, name: 'local' };
