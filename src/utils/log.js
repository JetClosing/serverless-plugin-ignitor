
const IDENTIFIER = 'Ignitor:';
const IDENTIFIER_COLOR = '\x1b[32m';
const COLOR_RESET = '\x1b[0m';

/* istanbul ignore next */
module.exports = (...args) => console.log(
  `${IDENTIFIER_COLOR}${IDENTIFIER}${COLOR_RESET}`,
  ...args,
);
