const get = require('../get');

const src = {
  f: [
    '3',
    {
      foo: 'bar',
      missing: undefined,
    },
  ],
};

test('happy path', () => {
  expect(get(src, 'f[1].foo')).toEqual('bar');
});

test('happy path - undefined', () => {
  expect(get(src, 'f[1].foo.missing', 'yolo')).toEqual('yolo');
});

test('invalid path - default', () => {
  expect(get(src, 'g[0]', 'nope')).toEqual('nope');
});
