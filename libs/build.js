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

const wrap = (name, handler, wrapper = DEFAULT_WRAPPER) => {
  const [wrapperPath, wrapperFunctionName] = wrapper.split('.');
  const [inputPath, functionName] = handler.split('.');

  const overridePath = `${BUILD_DIR}/${name}.default`;
  const overrideFilename = `${name}.js`;
  const outputPath = path.resolve(BUILD_DIR, overrideFilename);

  const requireOriginal = `const { ${functionName} } = require('../${inputPath}');`;
  const requireWrapperPrefix = wrapper === DEFAULT_WRAPPER ? '.' : '..';
  const requireWrapper = `const { ${wrapperFunctionName} } = require('${requireWrapperPrefix}/${wrapperPath}');`;
  const exportModule = `module.exports = { default: ${wrapperFunctionName}(${functionName}) };`;

  write(outputPath, `${requireOriginal}\n${requireWrapper}\n\n${exportModule}`);
  return overridePath;
};

const clean = () => rm(BUILD_DIR);

module.exports = {
  prebuild,
  wrap,
  clean,
};
