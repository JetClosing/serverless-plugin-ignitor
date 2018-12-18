
// generate a wrapper template
const generate = (filename, module) => `const original = require('../${filename}');

module.exports['handler'] = function (evt, ctx, cb) {
  if (evt.ignitor) {
    return cb(null, 'pinged');
  }

  return original.${module}(evt, ctx, cb);
};`

module.exports = {
  generate: generate,
};