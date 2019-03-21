const LEADING_ARRAY = /\[/g;
const TAILING_ARRAY = /^\[|\]/g;

module.exports = (obj, path, def) => {
  try {
    return path
      .replace(TAILING_ARRAY, '')
      .replace(LEADING_ARRAY, '.')
      .split('.')
      .reduce((a, b) => a[b], obj) || def;
  } catch (e) {
    return def;
  }
};
