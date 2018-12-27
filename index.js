'use strict';
const bPromise = require('bluebird');

const build = require('./libs/build');
const deploy = require('./libs/deploy');
const optionUtils = require('./libs/optionUtils');

class IgnitorPlugin {
  constructor(sls, options) {
    this.sls = sls;
    this.stage = options.stage;
    this.verbose = options.v;
    this.originalServicePath = this.sls.config.servicePath;

    this.provider = this.sls.getProvider('aws');

    // save this for later use
    this.localOptions = options.f || options.function;

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
    // if this is a local invoke, don't wrap EVERYTHING
    // provide a short list of the function being called
    this.slsFunctionsRef = this.sls.service.functions;
    this.slsFunctions = this.localOptions ? [this.localOptions] : Object.keys(this.slsFunctionsRef);
    const ignitorOptions = this.sls.service.custom.ignitor;

    // TODO: legacy options, force migrate to new API
    if (ignitorOptions.hasOwnProperty('functions')) {
      throw new Error(`serverless-plugin-ignitor API has changed, please update any custom variable declarations`);
    }
    
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

      // this looks a little funny but we need to maintain the 'schedule' property name
      this.slsFunctionsRef[name].events.push({ schedule: schedule });
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

    for (const option of options) {
      const { schedule, name } = option;
      if (!schedule) {
        continue;
      }

      this.sls.cli.log(`Igniting source ${name}`);
      const { input } = schedule;
      deploy.deploy(name, input, this.stage);
    }
  }
  
}

module.exports = IgnitorPlugin;
