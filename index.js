'use strict';
const bPromise = require('bluebird');

const build = require('./libs/build');
const deploy = require('./libs/deploy');
const fileUtils = require('./libs/fileUtils');
const optionUtils = require('./libs/optionUtils');

class IgnitorPlugin {
  constructor(sls, options) {
    this.sls = sls;
    this.stage = options.stage;
    this.verbose = options.v;
    this.originalServicePath = this.sls.config.servicePath;

    // if this is a local invoke, don't wrap EVERYTHING
    // provide a short list of the function being called
    const localOptions = options.f || options.function;
    this.slsFunctions = localOptions ? [localOptions] : Object.keys(this.sls.service.functions);
    this.slsFunctionsRef = this.sls.service.functions;

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
        .then(build.prebuild)
        .then(this.wrap),

      'ignitor:deploy:deploy': () => bPromise.bind(this)
        .then(this.deploy),

      'ignitor:clean:clean': () => bPromise.bind(this)
        .then(build.clean),
    };
  }

  options() {
    const ignitorOptions = this.sls.service.custom.ignitor;
    return optionUtils.build(ignitorOptions, this.slsFunctions);
  }

  schedule() {
    const options = this.options();

    this.sls.cli.log('Scheduling ignitor functions...');
    for (const option of options) {
      const { schedule, name } = option;
      if (!schedule) {
        continue;
      }

      this.sls.service.functions[name].events.push(schedule);
    }
  }

  wrap() {
    const options = this.options();
    
    this.sls.cli.log('Wrapping ignitor functions...');
    for (const option of options) {
      const { name, wrapper } = option;

      const { handler } = this.slsFunctionsRef[name];
      this.sls.cli.log(`Wrapped ${handler}`);

      this.slsFunctionsRef[name].handler = build.wrap(name, handler, wrapper, this.verbose);
    }
  }

  deploy() {
    const options = this.options();
    // TODO: add ability to disable post-deploy invoke
    const deployableFunctions = Object.keys(options);

    this.sls.cli.log(`Igniting source(s) ${JSON.stringify(deployableFunctions)}`);
    for (const option of options) {
      const { schedule, name } = option;
      if (!schedule) {
        continue;
      }

      const { input } = schedule;
      deploy.deploy(name, input, this.stage);
    }
  }
  
}

module.exports = IgnitorPlugin;
