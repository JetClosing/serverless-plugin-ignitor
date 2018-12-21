
const wrapper = (original) => (evt, ctx, cb) => {
  cb(null, 'Deprecated: this lambda is no longer supported');
};
