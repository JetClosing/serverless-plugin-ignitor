const path = require('path');
const {
  exists,
  read,
  write,
  rm,
  mkdir,
  cli,
} = require('../fileUtils');

const testDir = path.resolve(__dirname, 'test');

const testFile = path.resolve(__dirname, 'test', 'testRead.js');

const testContent = 'const foo = \'hello\';';

describe('fileUtils', () => {
  test('test basic file operations', () => {
    mkdir(testDir);

    expect(exists(testDir));

    write(testFile, testContent);

    expect(exists(testFile));

    const content = read(testFile);
    expect(content).toEqual(testContent);

    rm(testDir);

    expect(exists(testDir)).toBeFalsy();
  });
});

test('test cli', () => {
  const echoResponse = cli('echo "Hello"').toString('utf8');
  expect(echoResponse.trim()).toEqual('Hello');
}); 
