const hbs = require('handlebars');
const { load } = require('./template');

// load handlebars template
const delegate = load('delegate');

// create the delegate method, with configured rates
const create = (rates) => hbs.compile(delegate)({
  rates: JSON.stringify(rates, null, 2),
});

// create an event for the delegate method
const events = (rates) => Object.keys(rates).map((rate) => ({
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
