'use strict';

const fs = require('fs');
const sharp = require('sharp');
const yup = require('yup');
const generator = require('random-seed');
const Endpoint = require('fancy-guppy/endpoint.js');

class GetImage extends Endpoint {
  constructor(server, database, logger) {
    const config = {
      method: 'get',
      path: [
        '/i/:short_url.:format/:width-:height',
        `/i/:short_url/:width-:height`,
        //'/i/:short_url/:preset',
        //'/i/:short_url.:format/:preset',
        '/i/:short_url.:format',
        '/i/:short_url'
      ],
      scopes: [],
      transaction: true,
      authenticator: 'none',
      request_schemas: []
    };

    super(server, database, logger, config);
    this.log = logger.child(__filename);
  }

  endpoint(req, res, next, transaction) {
    //const image = await this.models.Image.findOne({ where: { short_url: req.params.short_url } });

    //if (!image) return res.status(404).render('404');

    const raw_stream = fs.createReadStream(require.resolve('fancy-guppy/static/test.jpg'));

    raw_stream.on('error', err => {
      return res.status(404).render('404', { err });
    });

    const transformer = sharp();

    console.log(req.params);
    if (req.params.width && req.params.height) {
      transformer.resize({
        width: parseInt(req.params.width),
        height: parseInt(req.params.height),
        fit: 'outside',
        position: sharp.strategy.entropy
      });
    }

    let format = 'jpg';
    if (['png', 'jpg', 'jpeg', 'webp', 'tiff', 'raw'].includes(req.params.format)) {
      format = req.params.format;
      transformer.toFormat(format);
    }

    res.contentType(`image/${format}`);
    const processed_stream = raw_stream.pipe(transformer).pipe(res);
  }
}

module.exports = { controller: GetImage, priority: 'aayx' };
