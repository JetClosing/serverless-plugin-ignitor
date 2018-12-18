const template = require('../template');

test('function exported', () => {
  expect(template.generate).toBeDefined();
});

test('generates expected output', () => {
  expect(template.generate('foo', 'handler')).toMatchSnapshot();
});