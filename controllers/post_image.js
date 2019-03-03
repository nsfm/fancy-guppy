'use strict';

const fs = require('fs');
const yup = require('yup');
const multer = require('multer');
const sharp = require('sharp');
const generator = require('random-seed');
const Endpoint = require('fancy-guppy/endpoint.js');

class PostImage extends Endpoint {
  constructor(server, database, logger) {
    const upload = multer({
      dest: '/tmp/fancy_guppy/request_storage',
      fileFilter: (req, file, callback) => {
        console.log(file.mimetype);
        callback(null, true);
      },
      limits: {
        // Limits are in bytes.
        fieldNameSize: 100,
        fieldSize: 1024 * 1024 * 20,
        fields: 10,
        fileSize: 1024 * 1024 * 20,
        files: 50,
        parts: 50,
        headerPairs: 100
      }
    });

    const config = {
      method: 'post',
      path: '/images',
      scopes: [],
      transaction: true,
      authenticator: 'token',
      request_schemas: [],
      upload_middleware: upload.fields([{ name: 'image', maxCount: 50 }])
    };

    super(server, database, logger, config);
    this.log = logger.child(__filename);

    this.url_generators = {
      short_alpha: url => {
        // Seed the RNG with the url for predictable shortenings.
        const random = generator.create(url);
        const characters = 'abcdefghijklmnopqrstuvwxyz1234567890';
        let length = 8;
        let string = '';
        for (let i = 0; i < 8; i++) {
          string += characters[random.range(characters.length - 1)];
        }
        return string;
      }
    };
  }

  async endpoint(req, res, next, transaction) {
    // TODO: Ratelimiting on the processing_queue.
    const processing_queue = [];
    for (const file of req.files.image) {
      processing_queue.push(
        new Promise(async (resolve, reject) => {
          try {
            // Insert the database entry first so we can get an ID.
            const img = await this.models.Image.create(
              {
                account: req.data.account.id,
                short_url: this.url_generators.short_alpha(Math.random())
              },
              { transaction }
            );

            const input = fs.createReadStream(file.path);
            const output = fs.createWriteStream('/tmp/fancy_guppy/' + img.id);
            const transform = sharp()
              .limitInputPixels(9000 * 9000)
              .webp();

            input.pipe(transform).pipe(output);

            output.on('finish', () => {
              fs.unlink(file.path, () => {
                resolve(img.get({ plain: true }));
              });
            });
          } catch (err) {
            reject(err);
          }
        })
      );
    }

    let images = [];
    try {
      images = await Promise.all(processing_queue);
    } catch (err) {
      this.log.warn(err, 'Failed to upload a file.');
      return next(err);
    }

    return res.json({ images });
  }
}

module.exports = { controller: PostImage, priority: 'aamx' };
