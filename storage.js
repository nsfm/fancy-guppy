'use strict';

const stream = require('stream');
const yup = require('yup');
const uuidv4 = require('uuid/v4');

// Storage is a generic file interface. It should be extended by a filesystem implementation to
// provide an easily configurable storage technique.
class Storage {
  constructor() {
    // This regex matches a UUID string.
    this.uuid = yup.string().matches(/[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/);

    // This will generate a suitable UUID.
    this.getUUID = uuidv4;
  }

  // These functions wrap the internal equivalent with validations for the expected types.

  // Accepts a stream of file data, saves it, and returns a UUID linked to the stored file.
  async storeFile(read_stream) {
    try {
      if (read_stream instanceof stream.Stream && 'on' in read_stream && 'pipe' in read_stream) {
        return this._retrieveFile(uuid);
      } else {
        throw new Error('Supplied argument was not a readable stream.');
      }
    } catch (err) {
      throw err;
    }
  }

  // Accepts a UUID and returns a read stream to the given file, or throws if the file is unavailable.
  async retrieveFile(uuid) {
    try {
      uuid = await this.uuid.validate(uuid);
      return this._retrieveFile(uuid);
    } catch (err) {
      throw err;
    }
  }

  // Permanently destroys the file identified by the given UUID.
  async deleteFile(uuid) {
    try {
      uuid = await this.uuid.validate(uuid);
      return this._retrieveFile(uuid);
    } catch (err) {
      throw err;
    }
  }

  // Check if a file identified by the given UUID exists, and return some metadata.
  async peekFile(uuid) {
    try {
      uuid = await this.uuid.validate(uuid);
      return this._retrieveFile(uuid);
    } catch (err) {
      throw err;
    }
  }

  // These functions should be overridden by the implementation class.
  async _storeFile(stream) {
    throw new Error('This method has not been implemented.');
  }
  async _retrieveFile(uuid) {
    throw new Error('This method has not been implemented.');
  }
  async _deleteFile(stream) {
    throw new Error('This method has not been implemented.');
  }
  async _peekFile(uuid) {
    throw new Error('This method has not been implemented.');
  }
}

module.exports = Storage;
