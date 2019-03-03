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
              .max(9000),
            height: yup
              .number()
              .integer()
              .positive()
              .max(9000),
            trim: yup
              .number()
              .integer()
              .positive()
              .max(100),
            blur: yup
              .number()
              .integer()
              .positive()
              .max(75),
            sharpen: yup
              .number()
              .integer()
              .positive()
              .max(255),
            median: yup
              .number()
              .integer()
              .positive()
              .max(30),
            flip: yup.boolean(),
            flop: yup.boolean(),
            rotate: yup
              .number()
              .integer()
              .positive()
              .max(359),
            negate: yup.boolean(),
            normalise: yup.boolean(),
            threshold: yup
              .number()
              .integer()
              .positive()
              .max(255),
            tint: yup
              .string()
              .matches(
                /^(#[a-f0-9]{6}|black|green|silver|gray|olive|white|yellow|maroon|navy|red|blue|purple|teal|fuchsia|aqua)$/i
              ),
            linear: yup
              .number()
              .integer()
              .positive()
              .max(100),
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
              .max(100)
          }),
          params: yup.object().shape({
            img_code: yup.string().required(),
            format: yup.string().oneOf(['png', 'jpg', 'jpeg', 'webp', 'raw'])
          })
        }
      ]
    };

    super(server, database, logger, config);
    this.log = logger.child(__filename);
  }

  async endpoint(req, res, next) {
    //const image = await this.models.Image.findOne({ where: { short_url: req.params.img_code } });

    //if (!image) return res.status(404).render('404');
    const raw_stream = fs.createReadStream(require.resolve('fancy-guppy/static/test.jpg'));

    raw_stream.on('error', err => {
      this.log.warn('Failed to access file.', { err });
      return res.status(404).render('404', { err });
    });

    // Construct the image processing stream and apply a maximum image size we'll allow to process.
    const transformer = sharp().limitInputPixels(9000 * 9000);

    // Start streaming the file.
    raw_stream.pipe(transformer);

    // Simple filters that can be reasonably configured with a single query parameter will be loaded from one of two
    // arrays. Most pre-resize filters modify the image size, so they should come before the resize to make sure the
    // user gets the dimensions they requested. Quality filters should be applied before or after the resize depending
    // on whether the image size increases or not. We'd rather apply these filters when the image is smallest to avoid
    // wasting processing power.

    const simple_filters_pre = ['extend', 'rotate', 'threshold', 'extractChannel', 'removeAlpha', 'trim'];

    const simple_filters_quality = [
      'blur',
      'ensureAlpha',
      'flip',
      'flop',
      'grayscale',
      'greyscale',
      'linear',
      'median',
      'negate',
      'normalise',
      'normalize',
      'sharpen',
      'tint',
      'toColorspace',
      'toColourspace'
    ];

    // Apply the pre-resize filters now.
    for (const filter of simple_filters_pre) {
      if (req.query[filter]) console.log('applying ' + filter);
      if (req.query[filter]) transformer[filter](req.query[filter]);
    }

    // Get the metadata now that the size of the image may have been changed.
    const metadata = await transformer.metadata();

    // Check for resize options. We need to predetermine if the image will grow or shrink.
    const resize_options = {};
    if (req.query.height) resize_options.height = req.query.height;
    if (req.query.width) resize_options.width = req.query.width;

    let size_increasing = false;
    const original_size = metadata.width * metadata.height;
    switch (Object.keys(resize_options).length) {
      case 1:
        const dimension = Object.keys(resize_options)[0];
        const scaling_factor = resize_options[dimension] / metadata[dimension];
        size_increasing = original_size < metadata.width * scaling_factor * metadata.height * scaling_factor;
        break;
      case 2:
        size_increasing = original_size < resize_options.width * resize_options.height;
        break;
      default:
        size_increasing = false;
    }

    console.log(size_increasing);
    if (size_increasing) {
      for (const filter of simple_filters_quality) {
        if (req.query[filter]) transformer[filter](req.query[filter]);
      }
    }

    if (Object.keys(resize_options).length) {
      // Set up some additional default options.
      if (!'fit' in resize_options) resize_options.fit = sharp.fit.cover;
      if (!'position' in resize_options) resize_options.position = sharp.strategy.attention;
      transformer.resize(resize_options);
    }

    if (!size_increasing) {
      for (const filter of simple_filters_quality) {
        if (req.query[filter]) transformer[filter](req.query[filter]);
      }
    }

    // Set the new file format, if specified. All images should be stored as webp.
    let format = 'webp';
    if (req.params.format && req.params.format !== format) {
      format = req.params.format;
      transformer.toFormat(format);
    }

    // Redirect the image data stream back to the response.
    res.contentType(`image/${format}`);
    transformer.pipe(res);
  }
}

module.exports = { controller: GetImage, priority: 'aayx' };
