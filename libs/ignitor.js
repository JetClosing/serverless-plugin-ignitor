
const ignitor = (original) => (evt, ctx, cb) => {
  if (evt.ignitor) {
    return cb(null, 'pinged');
  }

  return original(evt, ctx, cb);
};

module.exports = { ignitor };
