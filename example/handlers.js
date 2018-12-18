
const hello = (event, context, callback) => {
  console.log('hello!');
  callback(null, 'success');
};

module.exports = {
  hello: hello,
};