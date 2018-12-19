
const hello = (event, context, callback) => {
  callback(null, 'hello!');
};

const runOnce = (event, context, callback) => {
  callback(null, 'No one puts baby in a schedule');
};

const goodbye = (event, context, callback) => {
  callback(null, 'goodbye!');
};

module.exports = {
  hello,
  runOnce,
  goodbye,
};