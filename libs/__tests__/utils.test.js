const utils = require('../utils');
const path = require('path');
const fs = require('fs');

const MOCK_FILE = path.resolve(__dirname, 'example.js');

const MOCK_DIR = path.resolve(__dirname, 'foo');

test('functions exported', () => {
  expect(utils.write).toBeDefined();
  expect(utils.mkdir).toBeDefined();
  expect(utils.rm).toBeDefined();
  expect(utils.cli).toBeDefined();
});

test('write file', () => {
  utils.write(MOCK_FILE, 'console.log(\'hi\')');
  expect(fs.readFileSync(MOCK_FILE, 'utf8')).toMatchSnapshot();

  utils.rm(MOCK_FILE);
});

test('create directory', () => {
  utils.mkdir(MOCK_DIR);
  expect(fs.existsSync(MOCK_DIR)).toBeTruthy();

  utils.rm(MOCK_DIR);
});

test('test cli', () => {
  const echoResponse = utils.cli('echo "Hello"').toString('utf8');
  expect(echoResponse.trim()).toEqual('Hello');
}); 