const hbs = require('handlebars');
const { load } = require('./template');

const delegate = load('delegate');

const create = (fml) => hbs.compile(delegate)({
  fml: JSON.stringify(fml, null, 2),
});

const events = (fml) => Object.keys(fml).map((rate) => ({
  schedule: {
    rate,
    enabled: true,
    input: {
      rate,
    },
  },
}));

module.exports = {
  create,
  events,
};
