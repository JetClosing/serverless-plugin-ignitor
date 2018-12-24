
const hello = (event, context, callback) => {
  console.log('hello!');
  callback(null, 'success');
};

const goodbye = (event, context, callback) => {
  console.log('goodbye!');
  callback(null, 'success');
};

module.exports = {
  hello,
  goodbye
};