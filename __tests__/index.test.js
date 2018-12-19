const deploy = require('../libs/deploy').deploy;
const IgnitorPlugin = require('../index');
const fs = require('fs');

jest.mock('../libs/deploy');

const exists = (filename) => {
  try {
    return fs.existsSync(filename); // existsSync throws if the file doesn't exist
  } catch (e) {
    return false; 
  }
}

const MOCK_SERVICE_PATH = __dirname;

const MOCK_SLS = {
  service: {
    name: 'test',
    functions: {
      hello: {
        handler: 'src/handlers.default',
        events: [],
      }
    },
    custom: {
      ignitor: {
        functions: [
          {
            name: '.*',
            schedule: true,
          }
        ]
      }
    }
  },
  cli: {
    log: jest.fn(),
  },
  config: {
    servicePath: MOCK_SERVICE_PATH,
  },
  pluginManager: jest.fn(),
}

const MOCK_OPTIONS = {
  stage: 'test',
};

test('IgnitorPlugin', () => {
  const plugin = new IgnitorPlugin(MOCK_SLS, MOCK_OPTIONS);
  console.log(plugin);
  expect(plugin).toMatchSnapshot();
  expect(plugin.options()).toMatchSnapshot();

  plugin.schedule();
  expect(plugin.sls.service.functions.hello.events).toMatchSnapshot();

  plugin.wrap();
  expect(exists('ignitor')).toBeTruthy();
  expect(plugin.sls.service.functions.hello.handler).toMatchSnapshot();

  plugin.deploy();
  expect(deploy).toHaveBeenCalledWith('hello', { 'ignitor': true }, 'test');

  plugin.clean();
  expect(exists('ignitor')).toBeFalsy();
});
