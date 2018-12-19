const path = require('path');
const utils = require('./utils');
const template = require('./template');
const memo = require('./memo').memo;

const DEFAULT_IGNITOR_EVENT = {
  "ignitor": true,
}

const DEFAULT_FUNCTION_OPTIONS = {
  name: '.*',
  schedule: true,
}

const DEFAULT_IGNITOR_SCHEDULE = {
  rate: 'rate(5 minutes)',
  enabled: true,
  input: DEFAULT_IGNITOR_EVENT
};

const DEFAULT_OPTIONS = {
  functions: [
    DEFAULT_FUNCTION_OPTIONS,
  ],
};

// !!WARNING!! Do not include a '.' in the directory name 
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
  const [ignore, regExp, flags] = regexsplit;
  return new RegExp(regExp, flags);
};

const buildScheduledEvents = (schedule, event) => {
  const finalEvent = event || DEFAULT_IGNITOR_EVENT;
  const scheduledEvent = {
    rate: 'rate(5 minutes)',
    enabled: true,
    input: finalEvent
  };
  return {
    schedule: schedule ? scheduledEvent : null,
    event: finalEvent,
  }
};

const buildFunctionOptions = (servicePath, slsFunctions, option) => {
  const { name, schedule, wrapper, event } = option;
    
  const matcher = buildRegex(name);
  const functions = slsFunctions.reduce((acc, slsFunction) => {
    if (slsFunction.match(matcher)) {
      acc.push(slsFunction);
    }
    return acc;
  }, []);

  const scheduled = buildScheduledEvents(schedule, event);
  return {
    functions,
    wrapper: resolveWrapper(servicePath, wrapper),
    ...scheduled,
  };
}

const buildFunctions = (servicePath, slsFunctions, slsOptions) => {
  const options = {
    ...DEFAULT_OPTIONS,
    ...slsOptions,
  };

  const { functions } = options;
  return functions.map((option) => buildFunctionOptions(servicePath, slsFunctions, option));
};

const injectSchedule = (slsFunctions, builtOptions) => {
  const { functions, schedule } = builtOptions;
  if (schedule) {
    for (const name of functions) {
      slsFunctions[name].events.push({ schedule });
    }
  }
};

const wrapCode = (slsFunctions, cli, builtOptions) => {
  const { functions, wrapper } = builtOptions;
  for (const name of functions) {
    const { handler } = slsFunctions[name];
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
    slsFunctions[name].handler = handlerPath;
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