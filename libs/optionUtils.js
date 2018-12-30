

const DEFAULT_SCHEDULE = {
  rate: 'rate(5 minutes)',
  enabled: true,
  input: {
    ignitor: true,
  },
};

const DEFAULT_OPTIONS = {
  '.*': {},
};

const buildRegexFromKey = (key) => {
  const regexsplit = key.split(/(?<!\\)\//);

  if (regexsplit.length === 1) {
    return new RegExp(key);
  }

  const [, regExp, flags] = regexsplit;
  return new RegExp(regExp, flags);
};

const buildScheduledEvent = (schedule) => {
  // if user specifically set schedule to true or they didn't set any overrides
  // we know they wanted a manual schedule to be created
  if (schedule === undefined || schedule === null || schedule === true) {
    return DEFAULT_SCHEDULE;
  }

  if (typeof schedule === 'object' && !schedule.hasOwnProperty('input')) {
    throw new Error('Using a custom schedule requires a custom input defintion');
  }
  // if the user sets schedule to false, that's fine, this will only inject
  // the schedule if the schedule value is truthy anyway, otherwise if they have
  // defined a schedule manually, then let it passthrough
  return schedule;
};

const buildOption = (key, option, slsFunctions) => {
  const matcher = buildRegexFromKey(key);
  const schedule = buildScheduledEvent(option.schedule);
  const matches = slsFunctions.filter((slsFunction) => slsFunction.match(matcher));
  if (matches.length === 0) {
    console.warn(`No matches found for key ${key}`);
    return [];
  }
  return matches.map((name) => ({
    wrapper: option.wrapper,
    schedule,
    name,
  }));
};

const build = (options = DEFAULT_OPTIONS, slsFunctions) => {
  const optionKeys = Object.keys(options);
  return optionKeys.reduce((acc, key) => {
    const built = buildOption(key, options[key], slsFunctions);
    return acc.concat(built);
  }, []);
};

module.exports = {
  build,
  buildRegexFromKey,
  buildScheduledEvent,
  buildOption,
};
