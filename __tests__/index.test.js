const build = require('../libs/build');
const { deploy } = require('../libs/deploy');
const fileUtils = require('../libs/fileUtils');
const PluginIgnitor = require('../index');

jest.mock('../libs/deploy');

const baseIgnitorVariable = () => ({
  hello: {
    wrapper: 'wrappers.logger',
    schedule: {
      rate: 'rate(5 minutes)',
      enabled: true,
      input: {
        source: 'logger',
      },
    },
  },
  '/good.*/': {
    schedule: false,
  },
  '/non-matching/': {
    schedule: true,
  },
});

const generateSls = (custom) => ({
  getProvider: jest.fn(),
  config: {
    servicePath: 'test',
  },
  service: {
    functions: {
      hello: {
        handler: 'handlers.hello',
        timeout: 15,
        events: [],
      },
      goodbye: {
        handler: 'handlers.goodbye',
        events: [],
      },
    },
    custom,
  },
  pluginManager: {
    spawn: jest.fn(),
  },
  cli: {
    log: jest.fn(),
  },
});

const BASE_OPTIONS = {
  stage: 'development',
};

beforeEach(() => {
  build.prebuild();
});

afterEach(() => {
  build.clean();
});

describe('custom variable', () => {
  test('legacy custom variable', () => {
    expect.assertions(1);
    const sls = generateSls({
      ignitor: {
        functions: ['hello'],
      },
    });
    const plugin = new PluginIgnitor(sls, {});

    try {
      plugin.options();
    } catch (e) {
      expect(e.message).toEqual('serverless-plugin-ignitor API has changed, please update any custom variable declarations');
    }
  });

  test('new api', () => {
    const sls = generateSls({ ignitor: baseIgnitorVariable() });
    const plugin = new PluginIgnitor(sls, BASE_OPTIONS);
    const pluginOptions = plugin.options();
    expect(pluginOptions).toMatchSnapshot();
  });
});

describe('params', () => {
  test('local option -f', async () => {
    const sls = generateSls();
    const plugin = new PluginIgnitor(sls, {
      ...BASE_OPTIONS,
      f: 'hello',
    });
    plugin.wrap();

    expect(plugin.localOptions).toEqual('hello');
    expect(plugin.originalServicePath).toEqual('test');
    expect(plugin.slsFunctions).toEqual(['hello']);
    expect(plugin.stage).toEqual('development');
  });

  test('local options --function', async () => {
    const sls = generateSls();
    const plugin = new PluginIgnitor(sls, {
      function: 'hello',
      ...BASE_OPTIONS,
    });
    plugin.wrap();

    expect(plugin.localOptions).toEqual('hello');
    expect(plugin.originalServicePath).toEqual('test');
    expect(plugin.slsFunctions).toEqual(['hello']);
    expect(plugin.stage).toEqual('development');
  });
});

describe('schedule', () => {
  test('injects schedule', () => {
    const sls = generateSls({ ignitor: baseIgnitorVariable() });
    const plugin = new PluginIgnitor(sls, BASE_OPTIONS);
    plugin.schedule();
    expect(sls.service.functions.hello.events).toEqual([
      {
        schedule: {
          enabled: true,
          input: {
            source: 'logger',
          },
          rate: 'rate(5 minutes)',
        },
      },
    ]);
  });

  test('debuggable', () => {
    const temp = console.log;
    console.log = jest.fn();
    const sls = generateSls({ ignitor: baseIgnitorVariable() });
    const plugin = new PluginIgnitor(sls, BASE_OPTIONS);
    plugin.schedule(true);
    expect(console.log).toHaveBeenCalled();
    console.log = temp;
  });
});

describe('wrap', () => {
  test('generates code', async () => {
    const sls = generateSls({ ignitor: baseIgnitorVariable() });
    const plugin = new PluginIgnitor(sls, BASE_OPTIONS);
    plugin.wrap();
    expect(fileUtils.exists('ignitor/hello.js')).toBeTruthy();
  });

  test('debuggable', async () => {
    const temp = console.log;
    console.log = jest.fn();
    const sls = generateSls({ ignitor: baseIgnitorVariable() });
    const plugin = new PluginIgnitor(sls, BASE_OPTIONS);
    plugin.wrap(true);
    expect(console.log).toHaveBeenCalled();
    console.log = temp;
  });
});


test('deploy', async () => {
  const sls = generateSls({ ignitor: baseIgnitorVariable() });
  const plugin = new PluginIgnitor(sls, BASE_OPTIONS);
  plugin.deploy();
  expect(deploy).toHaveBeenCalledWith('hello', { source: 'logger' }, 'development');
});


describe('hooks', () => {
  const testSpawn = async (initial, children) => {
    const sls = generateSls();
    const plugin = new PluginIgnitor(sls, BASE_OPTIONS);
    await plugin.hooks[initial]();

    for (const child of children) {
      expect(sls.pluginManager.spawn).toHaveBeenCalledWith(child);
    }
  };

  describe('spawned', () => {
    test('after:deploy:deploy', async () => {
      await testSpawn('after:deploy:deploy', ['ignitor:deploy', 'ignitor:clean']);
    });

    test('before:package:createDeploymentArtifacts', async () => {
      await testSpawn('before:package:createDeploymentArtifacts', ['ignitor:schedule', 'ignitor:wrap']);
    });


    test('after:package:createDeploymentArtifacts', async () => {
      await testSpawn('after:package:createDeploymentArtifacts', ['ignitor:clean']);
    });

    test('before:deploy:function:packageFunction', async () => {
      await testSpawn('before:deploy:function:packageFunction', ['ignitor:schedule', 'ignitor:wrap']);
    });

    test('before:invoke:local:invoke', async () => {
      await testSpawn('before:invoke:local:invoke', ['ignitor:wrap']);
    });

    test('after:invoke:local:invoke', async () => {
      await testSpawn('after:invoke:local:invoke', ['ignitor:clean']);
    });

    test('before:run:run', async () => {
      await testSpawn('before:run:run', ['ignitor:wrap']);
    });

    test('after:run:run', async () => {
      await testSpawn('after:run:run', ['ignitor:clean']);
    });
  });

  describe('sls ignitor', () => {
    test('ignitor:ignitor', async () => {
      const sls = generateSls();
      const plugin = new PluginIgnitor(sls, BASE_OPTIONS);
      plugin.wrap = jest.fn();
      plugin.schedule = jest.fn();
      await plugin.hooks['ignitor:ignitor']();
      expect(plugin.wrap).toHaveBeenCalledWith(true);
      expect(plugin.schedule).toHaveBeenCalledWith(true);
    });
  });

  describe('ignitor', () => {
    test('ignitor:schedule:schedule', async () => {
      const sls = generateSls();
      const plugin = new PluginIgnitor(sls, BASE_OPTIONS);
      plugin.schedule = jest.fn();
      await plugin.hooks['ignitor:schedule:schedule']();
      expect(plugin.schedule).toHaveBeenCalled();
    });

    test('ignitor:wrap:wrap', async () => {
      const sls = generateSls();
      const plugin = new PluginIgnitor(sls, BASE_OPTIONS);
      plugin.wrap = jest.fn();
      await plugin.hooks['ignitor:wrap:wrap']();
      expect(plugin.wrap).toHaveBeenCalled();
    });

    test('ignitor:deploy:deploy', async () => {
      const sls = generateSls();
      const plugin = new PluginIgnitor(sls, BASE_OPTIONS);
      plugin.deploy = jest.fn();
      await plugin.hooks['ignitor:deploy:deploy']();
      expect(plugin.deploy).toHaveBeenCalled();
    });

    test('ignitor:clean:clean', async () => {
      const sls = generateSls();
      const plugin = new PluginIgnitor(sls, BASE_OPTIONS);
      const temp = build.clean;
      build.clean = jest.fn();
      await plugin.hooks['ignitor:clean:clean']();
      expect(build.clean).toHaveBeenCalled();
      build.clean = temp;
    });
  });
});
