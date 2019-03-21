

const custom = (original) => (evt, ctx, cb) => {
  console.log('Invoked @', Date.now(), 'with', JSON.stringify(evt, null, 2));
  if (evt.custom) {
    return cb(null, { pinged: true });
  }
  return original(evt, ctx, cb);
};

module.exports = {
  default: custom,
};
