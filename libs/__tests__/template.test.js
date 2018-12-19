const template = require('../template');

test('function exported', () => {
  expect(template.generate).toBeDefined();
});

test('generates expected output', () => {
  expect(template.generate('foo', 'handler', 'foo')).toMatchSnapshot();
});

test('generate overriden wrapper', () => {
  const override = `const wrapper = (original) => (evt, ctx, cb) => {
    cb('exit early');
  }`;
  expect(template.generate('foo', 'handler', 'help', override)).toMatchSnapshot();
});