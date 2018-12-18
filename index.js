'use strict';
const bPromise = require('bluebird');
const path = require('path');

const utils = require('./libs/utils');
const template = require('./libs/template');

const IGNITOR_EVENT = JSON.stringify({
  "ignitor": true
});

const SCHEDULE_IGNITOR_EVENT = {
  "schedule": {
    "rate": "rate(5 minutes)",
    "enabled": true,
    "input": {
      "ignitor": true,
    }
  }
};

const DEFAULT_OPTIONS = {
  schedule: true,
  functions: [],
};

// !!WARNING!! Do not include a '.' in the directory name 
const PACKAGE_DIR = 'ignitor';

const invokeRemote = (functionName, stage) => () => {
  utils.cli(`sls invoke -f ${functionName} --data '${IGNITOR_EVENT}' -s ${stage}`);
};

class IgnitorPlugin {
  constructor(sls, options) {
    this.sls = sls;
    this.stage = options.stage;
    this.originalServicePath = this.sls.config.servicePath;
    this.packageDir = path.resolve(this.originalServicePath, PACKAGE_DIR);

    this.commands = {
      ignitor: {
        usage: 'Keep lambda functions nice and toasty',
        lifecycleEvents: [
          'ignitor'
        ],
        commands: {
          schedule: {
            type: 'entrypoint',
            lifecycleEvents: [
              'schedule',
            ],
          },
          wrap: {
            type: 'entrypoint',
            lifecycleEvents: [
              'wrap',
            ],
          },
          deploy: {
            type: 'entrypoint',
            lifecycleEvents: [
              'deploy',
            ],
          },
          clean: {
            type: 'entrypoint',
            lifecycleEvents: [
              'clean',
            ],
          },
        },
      },
    };

    this.hooks = {
      'after:deploy:deploy': () => bPromise.bind(this)
        .then(() => this.sls.pluginManager.spawn('ignitor:deploy'))
        .then(() => this.sls.pluginManager.spawn('ignitor:clean')),

      'before:package:createDeploymentArtifacts': () => bPromise.bind(this)
        .then(() => this.sls.pluginManager.spawn('ignitor:schedule'))
        .then(() => this.sls.pluginManager.spawn('ignitor:wrap')),

      'after:package:createDeploymentArtifacts': () => bPromise.bind(this)
        .then(() => this.sls.pluginManager.spawn('ignitor:clean')),

      'before:deploy:function:packageFunction': () => bPromise.bind(this)
        .then(() => this.sls.pluginManager.spawn('ignitor:schedule'))
        .then(() => this.sls.pluginManager.spawn('ignitor:wrap')),

      'before:invoke:local:invoke': () => bPromise.bind(this)
        .then(() => this.sls.pluginManager.spawn('ignitor:wrap')),

      'after:invoke:local:invoke': () => bPromise.bind(this)
        .then(() => this.sls.pluginManager.spawn('ignitor:clean')),

      'before:run:run': () => bPromise.bind(this)
        .then(() => this.sls.pluginManager.spawn('ignitor:wrap')),

      'after:run:run': () => bPromise.bind(this)
        .then(() => this.sls.pluginManager.spawn('ignitor:clean')),

      'ignitor:schedule:schedule': () => bPromise.bind(this)
        .then(this.schedule),

      'ignitor:wrap:wrap': () => bPromise.bind(this)
        .then(this.wrap),

      'ignitor:deploy:deploy': () => bPromise.bind(this)
        .then(this.deploy),

      'ignitor:clean:clean': () => bPromise.bind(this)
        .then(this.clean),
    };
  }

  options() {
    const options = {
      ...DEFAULT_OPTIONS,
      ...this.sls.service.custom.ignitor,
    };

    const { functions } = options;

    // convert non-regex strings and regex strings into RegExp
    const expressions = functions.map((entry) => {
      const regexsplit = entry.split(/(?<!\\)\//);
      // found non-regex entry
      if (regexsplit.length === 1) {
        return new RegExp(entry);
      }

      const [ignore, regExp, flags] = regexsplit;
      return new RegExp(regExp, flags);
    });

    // find matching functions
    const slsFunctions = Object.keys(this.sls.service.functions);
    const matches = expressions.reduce((acc, entry) => {
      for (let slsEntry of slsFunctions) {
        if (slsEntry.match(entry)) {
          acc.push(slsEntry);
        }
      }
      return acc;
    }, []);

    return {
      ...options,
      functions: matches.filter((value, i, self) => self.indexOf(value) === i),
    };
  }

  schedule() {
    const { functions, schedule } = this.options();
    if (!schedule) {
      return;
    }

    this.sls.cli.log('Scheduling ignitor functions...');
    for (let name of functions) {
      this.sls.service.functions[name].events.push(SCHEDULE_IGNITOR_EVENT)
    }
  }

  wrap() {
    const { functions } = this.options();

    // make packageDir where wrappers are placed
    utils.mkdir(this.packageDir);
    
    this.sls.cli.log('Wrapping ignitor functions...');
    const names = Object.keys(this.sls.service.functions).filter((name) => functions.indexOf(name) !== -1);
    for (const name of names) {
      this.wrapFunction(name);
    }
  }
  
  wrapFunction(name) {
    const config = this.sls.service.functions[name];
    this.sls.cli.log(`Wrapped ${config.handler}`);

    // paths are constructed like <path>.<module> 
    const [relativePath, module] = config.handler.split('.');
    const handlerPath = `${PACKAGE_DIR}/${name}.handler`;
    const handlerFileName = `${name}.js`;
    const wrappedFilePath = path.resolve(PACKAGE_DIR, handlerFileName);
    const wrapperCode = template.generate(relativePath, module);

    // write wrapped code to wrappedFilePath
    utils.write(wrappedFilePath, wrapperCode);

    // update handler path
    this.sls.service.functions[name].handler = handlerPath;
  }

  deploy() {
    const { functions } = this.options();

    this.sls.cli.log(`Igniting source(s) ${JSON.stringify(functions)}`);
    for (const func of functions) {
      setTimeout(invokeRemote(func, this.stage), 1500);
    }
  }

  clean() {
    utils.rm(this.packageDir);
  }
  
}

module.exports = IgnitorPlugin;
