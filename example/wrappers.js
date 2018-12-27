

const logger = (original) => (evt, ctx, cb) => {
  console.log('Invoked @', Date.now(), 'with', JSON.stringify(evt, null, 2));
  return original(evt, ctx, cb);
};

module.exports = {
  logger,
};
