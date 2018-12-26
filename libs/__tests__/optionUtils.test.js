const { 
  build,
  buildRegexFromKey,
  buildScheduledEvent,
  buildOption,
} = require('../optionUtils');

const MOCK_DEFAULT_SCHEDULE = {
  enabled: true, 
  input: {
    ignitor: true,
  }, 
  rate: "rate(5 minutes)",
};

const MOCK_SLS_FUNCTIONS = ['hello', 'goodbye', 'authHandler'];

describe('buildRegexFromKey', () => {
  test('regex argument', () => {
    expect(buildRegexFromKey('/.*Handler/i')).toMatchSnapshot();
  });

  test('normal name', () => {
    expect(buildRegexFromKey('hello')).toMatchSnapshot();
  });
});

describe('buildScheduledEvent', () => {
  test('true argument - gives default', () => {
    const response = buildScheduledEvent(true);
    expect(response).toEqual({
      enabled: true, 
      input: {
        ignitor: true,
      }, 
      rate: "rate(5 minutes)",
    });
  });

  test('no argument - gives default', () => {
    const response = buildScheduledEvent(null);
    expect(response).toEqual({
      enabled: true, 
      input: {
        ignitor: true,
      }, 
      rate: "rate(5 minutes)",
    });
  });

  test('null argument - gives default', () => {
    const response = buildScheduledEvent(null);
    expect(response).toEqual({
      enabled: true, 
      input: {
        ignitor: true,
      }, 
      rate: "rate(5 minutes)",
    });
  });

  test('undefined argument - gives default', () => {
    const response = buildScheduledEvent(null);
    expect(response).toEqual({
      enabled: true, 
      input: {
        ignitor: true,
      }, 
      rate: "rate(5 minutes)",
    });
  });

  test('false argument - passthrough', () => {
    const response = buildScheduledEvent(false);
    expect(response).toEqual(false);
  });

  test('override argument - passthrough', () => {
    const schedule = {
      enabled: true,
      rate: 'rate(3 minutes)',
      input: {
        custom: 'event',
      },
    };
    const response = buildScheduledEvent(schedule);
    expect(response).toEqual(schedule);
  });

  test('override without input - error', () => {
    expect.assertions(1);
    const schedule = {
      enabled: true,
      rate: 'rate(3 minutes)',
    };
    try {
      buildScheduledEvent(schedule);
    } catch (e) {
      expect(e.message).toEqual('Using a custom schedule requires a custom input defintion');
    }
  });
});

describe('buildOption', () => {
  test('default options', () => {
    const response = buildOption('.*', {}, MOCK_SLS_FUNCTIONS);

    const [first, second, third] = response;
    expect(first.wrapper).toBeUndefined();
    expect(first.name).toEqual('hello');

    expect(second.wrapper).toBeUndefined();
    expect(second.name).toEqual('goodbye');

    expect(third.wrapper).toBeUndefined();
    expect(third.name).toEqual('authHandler');

    expect(response).toMatchSnapshot();
  });

  test('regex option', () => {
    const response = buildOption('/.*handler/i', {}, MOCK_SLS_FUNCTIONS);
    const [first] = response;
    expect(first.wrapper).toBeUndefined();
    expect(first.name).toEqual('authHandler');
    expect(first.schedule).toEqual(MOCK_DEFAULT_SCHEDULE);
  });

  test('no schedule', () => {
    const options = {
      schedule: false,
    };
    const response = buildOption('/.*handler/i', options, MOCK_SLS_FUNCTIONS);
    const [first] = response;
    expect(first.wrapper).toBeUndefined();
    expect(first.name).toEqual('authHandler');
    expect(first.schedule).toEqual(false);
  });

  test('override schedule', () => {
    const options = {
      schedule: {
        rate: 'rate(3 minutes)',
        enabled: true,
        input: {
          custom: 'source',
        },
      },
    };
    const response = buildOption('/.*handler/i', options, MOCK_SLS_FUNCTIONS);
    const [first] = response;
    expect(first.wrapper).toBeUndefined();
    expect(first.name).toEqual('authHandler');
    expect(first.schedule).toEqual(options.schedule);
  });

  test('override schedule + wrapper', () => {
    const options = {
      wrapper: 'src/wrappers.logger',
      schedule: {
        rate: 'rate(3 minutes)',
        enabled: true,
        input: {
          custom: 'source',
        },
      },
    };
    const response = buildOption('/.*handler/i', options, MOCK_SLS_FUNCTIONS);
    const [first] = response;
    expect(first.wrapper).toEqual('src/wrappers.logger');
    expect(first.name).toEqual('authHandler');
    expect(first.schedule).toEqual(options.schedule);
  });

  test('invalid schedule override', () => {
    expect.assertions(1);
    const options = {
      schedule: {
        rate: 'rate(3 minutes)',
        enabled: true,
      },
    };
    try {
      buildOption('/.*handler/i', options, MOCK_SLS_FUNCTIONS);
    } catch (e) {
      expect(e.message).toEqual('Using a custom schedule requires a custom input defintion');
    }
  });

  test('no match', () => {
    const response = buildOption('foo', {}, MOCK_SLS_FUNCTIONS);
    expect(response).toHaveLength(0);
  });
});

describe('build', () => {
  test('default path', () => {
    const response = build(undefined, MOCK_SLS_FUNCTIONS);
    expect(response).toMatchSnapshot();
  });

  test('hello with wrapper', () => {
    const options = {
      hello: {
        wrapper: 'src/wrappers.ping',
      },
    };
    const response = build(options, MOCK_SLS_FUNCTIONS);
    expect(response).toEqual([
      {
        name: "hello",
        schedule: {
          enabled: true,
          input: {
            ignitor: true,
          },
          rate: "rate(5 minutes)",
        },
        wrapper: "src/wrappers.ping",
      }
    ]);
  });
});