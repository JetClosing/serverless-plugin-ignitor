const path = require('path');
const {
  mkdir, rm, write, read,
} = require('./fileUtils');

// !!WARNING!! Do not include a '.' in the directory name this confuses
// sls during local invokes and compilers with a MODULE_NOT_FOUND error
const BUILD_DIR = 'ignitor';

const DEFAULT_WRAPPER = 'ignitor.ignitor';

const prebuild = () => {
  mkdir(BUILD_DIR);

  // prebuild default wrapper into the build directory
  const defaultWrapper = read(path.resolve(__dirname, 'ignitor.js'));
  const defaultWrapperPath = path.resolve(BUILD_DIR, 'ignitor.js');
  write(defaultWrapperPath, defaultWrapper);
};

const wrap = (name, handler, wrapper = DEFAULT_WRAPPER, debug) => {
  const [wrapperPath, wrapperFunctionName] = wrapper.split('.');
  const [inputPath, functionName] = handler.split('.');

  const overridePath = `${BUILD_DIR}/${name}.handler`;
  const overrideFilename = `${name}.js`;
  const outputPath = path.resolve(BUILD_DIR, overrideFilename);

  const requireOriginal = `const original = require('../${inputPath}').${functionName};`;
  const requireWrapperPrefix = wrapper === DEFAULT_WRAPPER ? '.' : '..';
  const requireWrapper = `const wrapper = require('${requireWrapperPrefix}/${wrapperPath}').${wrapperFunctionName};`;
  const exportModule = `module.exports = { handler: wrapper(original) };`;

  write(outputPath, `${requireOriginal}\n${requireWrapper}\n\n${exportModule}`);
  if (debug) {
    console.log(`Generated file:\n\t${outputPath}\nHandler:\n\t${handler} ...`);
    console.log(`Overriden Handler:\n\t${overridePath}\n`);
  }
  return overridePath;
};

const clean = () => rm(BUILD_DIR);

module.exports = {
  prebuild,
  wrap,
  clean,
};
