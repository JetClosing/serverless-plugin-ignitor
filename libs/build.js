const path = require('path');
const utils = require('./utils');
const template = require('./template');
const memo = require('./memo').memo;

const DEFAULT_FUNCTION_OPTIONS = {
  name: '.*',
  schedule: true,
}

const DEFAULT_SCHEDULE = {
  rate: 'rate(5 minutes)',
  enabled: true,
  input: {
    ignitor: true,
  }
}

const DEFAULT_OPTIONS = [
  DEFAULT_FUNCTION_OPTIONS,
];

// !!WARNING!! Do not include a '.' in the directory name, this fails to load the module
// due to the leading period causing module resolution issues.
const PACKAGE_DIR = 'ignitor';

const resolveWrapper = (servicePath, wrapper) => {
  if (wrapper) {
    const filename = path.join(servicePath, wrapper);
    return utils.read(filename);
  }
  return null;
};

const buildRegex = (name) => {
  const regexsplit = name.split(/(?<!\\)\//);
  if (regexsplit.length === 1) {
    return new RegExp(name);
  }
  const [, regExp, flags] = regexsplit;
  return new RegExp(regExp, flags);
};

const buildSchedule = (schedule) => {
  // if user specifically set schedule to true or they didn't set any overrides
  // we know they wanted a manual schedule to be created
  if (schedule === null || schedule === true) {
    return DEFAULT_SCHEDULE;
  }

  // if the user sets schedule to false, that's fine, this will only inject
  // the schedule if the schedule value is truthy anyway, otherwise if they have
  // defined a schedule manually, then let it passthrough
  return schedule;
};

const buildFunctionOptions = (servicePath, slsFunctions, option) => {
  const { name, schedule, wrapper } = option;
    
  const matcher = buildRegex(name);
  const functions = slsFunctions.reduce((acc, slsFunction) => {
    if (slsFunction.match(matcher)) {
      acc.push(slsFunction);
    }
    return acc;
  }, []);

  return {
    wrapper: resolveWrapper(servicePath, wrapper),
    schedule: buildSchedule(schedule),
    functions,
  };
}

const buildFunctions = (servicePath, slsFunctions, slsOptions) => {
  const options = slsOptions || DEFAULT_OPTIONS;

  return options.map((option) => buildFunctionOptions(servicePath, slsFunctions, option));
};

const injectSchedule = (slsFunctionsRef, builtOptions) => {
  const { functions, schedule } = builtOptions;
  if (schedule) {
    for (const name of functions) {
      slsFunctionsRef[name].events.push({ schedule });
    }
  }
};

const wrapCode = (slsFunctionsRef, cli, builtOptions) => {
  const { functions, wrapper } = builtOptions;
  for (const name of functions) {
    const { handler } = slsFunctionsRef[name];
    cli.log(`Wrapped ${handler}`);

    // paths are constructed like <path>.<module> 
    const [relativePath, module] = handler.split('.');
    const handlerPath = `${PACKAGE_DIR}/${name}.handler`;
    const handlerFileName = `${name}.js`;
    const wrappedFilePath = path.resolve(PACKAGE_DIR, handlerFileName);
    const wrapperCode = template.generate(relativePath, module, name, wrapper);

    // write wrapped code to wrappedFilePath
    utils.write(wrappedFilePath, wrapperCode);

    // update handler path
    slsFunctionsRef[name].handler = handlerPath;
  }
};

const prebuild = () => {
  utils.mkdir(PACKAGE_DIR);
};

const clean = () => {
  utils.rm(PACKAGE_DIR);
};

module.exports = {
  functions: memo(buildFunctions),
  schedule: injectSchedule,
  wrap: wrapCode,
  prebuild: prebuild,
  clean: clean,
}