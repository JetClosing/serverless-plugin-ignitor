const bPromise = require('bluebird');
const path = require('path');

const build = require('./libs/build');
const deploy = require('./libs/deploy').deploy;

class IgnitorPlugin {
  constructor(sls, options) {
    this.sls = sls;
    this.stage = options.stage;
    this.originalServicePath = this.sls.config.servicePath;

    // if this is a local invoke, don't wrap everything
    // provide a short list of the function being called
    const localOptions = options.f || options.function;
    this.local = localOptions ? [localOptions] : null;

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
    const slsOptions = this.sls.service.custom.ignitor;
    const slsFunctionRef = this.sls.service.functions;
    const slsFunctions = this.local || Object.keys(this.sls.service.functions);
    return {
      functionOptions: build.functions(this.originalServicePath, slsFunctions, slsOptions),
      slsFunctionRef,
    };
  } 

  schedule() {
    const { slsFunctionRef, functionOptions } = this.options();

    this.sls.cli.log('Scheduling ignitor functions...');
    for (const options of functionOptions) {
      build.schedule(slsFunctionRef, options);
    }
  }

  wrap() {
    const { slsFunctionRef, functionOptions } = this.options();
    const slsCli = this.sls.cli;

    build.prebuild();

    this.sls.cli.log('Wrapping ignitor functions...');
    for (const option of functionOptions) {
      build.wrap(slsFunctionRef, slsCli, option);
    }
  }

  deploy() {
    const { functionOptions } = this.options();

    const allFunctions = this.local || functionOptions.reduce((acc, options) => acc.concat(options.functions), []);
    this.sls.cli.log(`Igniting source(s) ${JSON.stringify(allFunctions)}`);
    for (const option of options) {
      const { functions, event } = option;
      for (const name of functions) {
        deploy(name, event, this.stage);
      }
    }
  }

  clean() {
    build.clean();
  }
  
}

module.exports = IgnitorPlugin;
