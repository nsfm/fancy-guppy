'use strict';

const stream = require('stream');
const yup = require('yup');
const uuidv4 = require('uuid/v4');

/**
 *  To ensure that file storage methods can be easily configured, Storage represents a common interface for storing
 *  and retrieving generic files. It needs to be extended with a real implementation before use.
 *
 *  Note that the internal functions (prefaced with '_') should be extended, not the public ones. The public ones
 *  act as wrappers that validate the function inputs to further enforce the interface and provide a little bit of
 *  security.
 */
class Storage {
  /**
   *  The constructor initializes some utilities for validating and generating UUIDs.
   */
  constructor() {
    // This regex matches a UUID string.
    this.uuid = yup.string().matches(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);

    // This will generate a suitable UUID.
    this.getUUID = uuidv4;
  }

  /**
   *  Accepts a stream of file data, saves it, and returns a UUID linked to the stored file.
   *
   * @param {object} read_stream A readable stream of data to be stored.
   * @returns {string} A UUID that can be traced back to the stored data.
   */
  async storeFile(read_stream) {
    try {
      if (read_stream instanceof stream.Stream && 'on' in read_stream && 'pipe' in read_stream) {
        return this._storeFile(read_stream);
      } else {
        throw new Error('Supplied argument was not a readable stream.');
      }
    } catch (err) {
      throw err;
    }
  }

  /**
   *  Accepts a UUID and returns a read stream to the given file, or throws if the file is unavailable.
   *
   *  @param {string} uuid A UUID previously issued by storeFile.
   *  @returns {object} A readable stream to the expected file.
   */
  async retrieveFile(uuid) {
    try {
      uuid = await this.uuid.validate(uuid);
      return this._retrieveFile(uuid);
    } catch (err) {
      throw err;
    }
  }

  /**
   *  Permanently destroys the file identified by the given UUID, or throws on failure.
   *
   *  @param {string} uuid A UUID previously issued by storeFile.
   *  @returns {null} No return value.
   */
  async deleteFile(uuid) {
    try {
      uuid = await this.uuid.validate(uuid);
      return this._deleteFile(uuid);
    } catch (err) {
      throw err;
    }
  }

  /**
   *  Check if a file identified by the given UUID exists, and return some metadata.
   *
   *  Note - there's currently no standard for the values returned.
   *
   *  @param {string} uuid A UUID previously issued by storeFile.
   *  @returns {object} A map of metadata values.
   */
  async peekFile(uuid) {
    try {
      uuid = await this.uuid.validate(uuid);
      return this._peekFile(uuid);
    } catch (err) {
      throw err;
    }
  }

  /**
   *  Accepts a stream of file data, saves it, and returns a UUID linked to the stored file.
   *
   *  This method must be overridden by the extending implementation.
   *
   * @param {object} read_stream A readable stream of data to be stored.
   * @returns {string} A UUID that can be traced back to the stored data.
   */
  async _storeFile(read_stream) {
    throw new Error('This method has not been implemented.');
  }

  /**
   *  Accepts a UUID and returns a read stream to the given file, or throws if the file is unavailable.
   *
   *  This method must be overridden by the extending implementation.
   *
   *  @param {string} uuid A UUID previously issued by storeFile.
   *  @returns {object} A readable stream to the expected file.
   */
  async _retrieveFile(uuid) {
    throw new Error('This method has not been implemented.');
  }

  /**
   *  Permanently destroys the file identified by the given UUID, or throws on failure.
   *
   *  This method must be overridden by the extending implementation.
   *
   *  @param {string} uuid A UUID previously issued by storeFile.
   *  @returns {null} No return value.
   */
  async _deleteFile(uuid) {
    throw new Error('This method has not been implemented.');
  }

  /**
   *  Check if a file identified by the given UUID exists, and return some metadata.
   *
   *  Note - there's currently no standard for the values returned.
   *  This method must be overridden by the extending implementation.
   *
   *  @param {string} uuid A UUID previously issued by storeFile.
   *  @returns {object} A map of metadata values.
   */
  async _peekFile(uuid) {
    throw new Error('This method has not been implemented.');
  }
}

module.exports = Storage;
