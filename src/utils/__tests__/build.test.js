const path = require('path');
const build = require('../build');
const { read, exists } = require('../file');

const BUILD_DIR = 'ignitor';

const MOCK_FUNCTION_KEY = 'test';

const MOCK_HANDLER = 'src/handler.default';

test('prebuild', () => {
  build.prebuild();
  expect(exists(BUILD_DIR)).toBeTruthy();
});

describe('wrap', () => {
  test('use default wrapper', () => {
    const response = build.wrap(MOCK_FUNCTION_KEY, MOCK_HANDLER, undefined);
    expect(response).toEqual(`${BUILD_DIR}/${MOCK_FUNCTION_KEY}.handler`);

    const contents = read(path.resolve(BUILD_DIR, 'test.js'));
    expect(contents).toMatchSnapshot();
  });

  test('uses override wrapper', () => {
    const wrapperOverride = 'src/wrappers.auth';
    const response = build.wrap(MOCK_FUNCTION_KEY, MOCK_HANDLER, wrapperOverride);
    expect(response).toEqual(`${BUILD_DIR}/${MOCK_FUNCTION_KEY}.handler`);

    const contents = read(path.resolve(BUILD_DIR, 'test.js'));
    expect(contents).toMatchSnapshot();
  });
});

test('clean', () => {
  build.clean();
  expect(exists(BUILD_DIR)).toBeFalsy();
});
