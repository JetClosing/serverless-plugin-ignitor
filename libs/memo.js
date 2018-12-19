const util = require('util');

const memo = (original) => {
  let cache = {};

  return (...args) => {
    // get rid of circulare json structure
    const flattened = util.inspect(args); 

    // generate key
    const key = JSON.stringify(args);
    if (cache[key]) {
      return cache[key];
    }

    const response = original.apply(null, args);
    cache[key] = response;
    return response;
  };
};

module.exports = {
  memo: memo
};