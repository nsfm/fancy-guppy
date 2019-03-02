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
      path: '/i/:img_code', //'/im/:img_code.:fomat'],
      scopes: [],
      transaction: false,
      authenticator: 'none',
      request_schemas: [
        {
          query: yup.object().shape({
            width: yup
              .number()
              .integer()
              .positive()
              .lessThan(8192),
            height: yup
              .number()
              .integer()
              .positive()
              .lessThan(8192),
            trim: yup
              .number()
              .integer()
              .positive(),
            blur: yup
              .number()
              .integer()
              .positive()
              .lessThan(76),
            sharpen: yup
              .number()
              .integer()
              .positive()
              .lessThan(256),
            median: yup
              .number()
              .integer()
              .positive()
              .lessThan(30),
            flip: yup.boolean(),
            flop: yup.boolean(),
            rotate: yup
              .number()
              .integer()
              .positive(),
            negate: yup.boolean(),
            normalise: yup.boolean(),
            threshold: yup
              .number()
              .integer()
              .positive()
              .lessThan(256),
            tint: yup
              .string()
              .matches(
                /^(#[a-f0-9]{6}|black|green|silver|gray|olive|white|yellow|maroon|navy|red|blue|purple|teal|fuchsia|aqua)$/i
              ),
            linear: yup
              .number()
              .integer()
              .positive(),
            greyscale: yup.boolean(),
            grayscale: yup.boolean(),
            toColorspace: yup.mixed().oneOf(['srgb', 'rgb', 'cmyk', 'lab', 'b-w']),
            toColourspace: yup.mixed().oneOf(['srgb', 'rgb', 'cmyk', 'lab', 'b-w']),
            removeAlpha: yup.boolean(),
            ensureAlpha: yup.boolean(),
            extractChannel: yup.mixed().oneOf(['red', 'green', 'blue']),
            extend: yup
              .number()
              .integer()
              .positive()
          }),
          params: yup.object().shape({
            img_code: yup.string().required(),
            format: yup.string().oneOf(['png', 'jpg', 'jpeg', 'webp', 'tiff', 'raw'])
          })
        }
      ]
    };

    super(server, database, logger, config);
    this.log = logger.child(__filename);
  }

  endpoint(req, res, next) {
    //const image = await this.models.Image.findOne({ where: { short_url: req.params.img_code } });

    //if (!image) return res.status(404).render('404');
    console.log('a');
    const raw_stream = fs.createReadStream(require.resolve('fancy-guppy/static/test.jpg'));

    raw_stream.on('error', err => {
      this.log.warn('Failed to access file.', { err });
      return res.status(404).render('404', { err });
    });

    const transformer = sharp();

    // Check for resize options. If any are passed, prepare the transform stream for the resize operation.
    const resize_options = {};
    if (req.query.height) resize_options.height = req.query.height;
    if (req.query.width) resize_options.width = req.query.width;

    if (Object.keys(resize_options).length) {
      // Set up some additional default options.
      if (!'fit' in resize_options) resize_options.fit = sharp.fit.cover;
      if (!'position' in resize_options) resize_options.position = sharp.strategy.attention;
      transformer.resize(resize_options);
    }

    // Check to see if any of the simple filters have been requested.
    // All the filters that can be reasonably configured with one simple variable are here.
    // We'll perform these operations before the resize for maximum quality, I guess.
    const simple_filters = [
      'blur',
      'ensureAlpha',
      'extend',
      'extractChannel',
      'flip',
      'flop',
      'grayscale',
      'greyscale',
      'linear',
      'median',
      'negate',
      'normalise',
      'normalize',
      'removeAlpha',
      'rotate',
      'sharpen',
      'threshold',
      'tint',
      'toColorspace',
      'toColourspace',
      'trim'
    ];
    for (const filter of simple_filters) {
      if (req.query[filter]) transformer[filter](req.query[filter]);
    }

    let format = 'jpg';
    if (req.params.format) {
      format = req.params.format;
      transformer.toFormat(format);
    }

    res.contentType(`image/${format}`);
    const processed_stream = raw_stream.pipe(transformer).pipe(res);
  }
}

module.exports = { controller: GetImage, priority: 'aayx' };
