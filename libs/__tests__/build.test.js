const build = require('../build');
const template = require('../template');
const utils = require('../utils');
const path = require('path');

jest.mock('../utils');

beforeEach(() => {
  jest.resetAllMocks();
});

const MOCK_SERVICE_PATH = __dirname;

const MOCK_SLS_FUNCTION_REF = {
  hello: {
    handler: 'src/handlers.default',
    events: [],
  }
};

const MOCK_SLS_FUNCTIONS = Object.keys(MOCK_SLS_FUNCTION_REF);

const MOCK_OPTIONS = {
  functions: [
    {
      name: '.*',
      schedule: true,
    }
  ]
};

const MOCK_BUILT_OPTIONS = build.functions(MOCK_SERVICE_PATH, MOCK_SLS_FUNCTIONS, MOCK_OPTIONS);

const MOCK_FILE_OVERRIDE = `const wrapper = (original) => (evt, ctx, cb) => {
  cb('city and colour');
};`;

describe('building functions', () => {
  test('building options', () => {
    const response = build.functions(MOCK_SERVICE_PATH, MOCK_SLS_FUNCTIONS, MOCK_OPTIONS);
    expect(response).toEqual(MOCK_BUILT_OPTIONS);
  });

  test('can build overrides', () => {
    const OPTIONS = {
      functions: [
        {
          name: 'hello',
          wrapper: '../fake/path.js',
          schedule: false,
          event: {
            overriden: true,
          }
        }
      ]
    }

    utils.read.mockImplementation(() => MOCK_FILE_OVERRIDE);
    const [response] = build.functions(MOCK_SERVICE_PATH, MOCK_SLS_FUNCTIONS, OPTIONS);
    console.log(response);
    expect(response.event).toEqual({ overriden: true });
    expect(response.schedule).toBeNull();
    expect(response.functions).toEqual(['hello']);
    expect(response.wrapper).toEqual(MOCK_FILE_OVERRIDE);
  });
});

describe('schedule', () => {
  test('injects schedules', () => {
    const mockOptions = {
      functions: ['hello'],
      schedule: {
        "enabled": true, 
        "input": {
          "ignitor": true
        }, 
        "rate": "rate(5 minutes)"
      }
    };
    const refCopy = JSON.parse(JSON.stringify(MOCK_SLS_FUNCTION_REF));
    build.schedule(refCopy, mockOptions);
    expect(refCopy.hello.events).toEqual([
      {
        schedule: mockOptions.schedule
      }
    ]);
  });

  test('ignores unscheduled options', () => {
    const mockOptions = {
      functions: ['hello'],
      schedule: null
    };
    const refCopy = JSON.parse(JSON.stringify(MOCK_SLS_FUNCTION_REF));
    build.schedule(refCopy, mockOptions);
    expect(refCopy.hello.events).toHaveLength(0);
    expect(refCopy).toEqual(refCopy);
  });
});

describe('wrap', () => {
  test('wraps with default code', () => {
    const mockOptions = {
      functions: ['hello'],
      wrapper: template,
    };
    const cli = {
      log: jest.fn(),
    };
    const refCopy = JSON.parse(JSON.stringify(MOCK_SLS_FUNCTION_REF));
    build.wrap(refCopy, cli, mockOptions);
    expect(cli.log).toHaveBeenCalledWith('Wrapped src/handlers.default');
    expect(refCopy.hello.handler).toEqual('ignitor/hello.handler');
  });

  test('uses override wrapper', () => {
    const generate = jest.fn();
    const mockOptions = {
      functions: ['hello'],
      wrapper: MOCK_FILE_OVERRIDE,
    };
    const cli = {
      log: jest.fn(),
    };
    const EXPECTED_RESPONSE = [
      "const original = require('../src/handlers').default;",
      "",
      MOCK_FILE_OVERRIDE,
      "",
      "module.exports = { handler: wrapper(original) };"
    ].join('\n');
    const refCopy = JSON.parse(JSON.stringify(MOCK_SLS_FUNCTION_REF));
    build.wrap(refCopy, cli, mockOptions);
    expect(cli.log).toHaveBeenCalledWith('Wrapped src/handlers.default');
    expect(utils.write.mock.calls[0][1]).toEqual(EXPECTED_RESPONSE);
    expect(refCopy.hello.handler).toEqual('ignitor/hello.handler');
  });
});

test('prebuild builds wrapper directory', () => {
  build.prebuild();
  expect(utils.mkdir).toHaveBeenCalledWith('ignitor');
});

test('cleans up wrapper directory', () => {
  build.clean();
  expect(utils.rm).toHaveBeenCalledWith('ignitor');
});