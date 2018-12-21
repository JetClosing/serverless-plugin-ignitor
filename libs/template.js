
const DEFAULT_WRAPPER = `const wrapper = (original) => (evt, ctx, cb) => {
  if (evt.ignitor) {
    return cb(null, 'pinged');
  }
  return original(evt, ctx, cb);
};`;

const generate = (filename, module, name, content) => {
  const before = `const original = require('../${filename}').${module};`
  const after = `module.exports = { handler: wrapper(original) };`;
  const internal = content && typeof(content) === 'string' ? content : DEFAULT_WRAPPER;
  return `${before}\n\n${internal}\n\n${after}`;
};

module.exports = {
  generate: generate,
};