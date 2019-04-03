const fs = require('fs');
const path = require('path');

const templates = {
  delegate: path.resolve(__dirname, 'delegate.js.hbs'),
};

const load = (name) => fs.readFileSync(templates[name], 'utf8');

module.exports = {
  load,
};
