'use strict';
const bPromise = require('bluebird');

const build = require('./libs/build');
const fileUtils = require('./libs/fileUtils');
const optionUtils = require('./libs/optionUtils');

const invokeRemote = (functionName, stage) => () => {
  fileUtils.cli(`sls invoke -f ${functionName} --data '${IGNITOR_EVENT}' -s ${stage}`);
};

class IgnitorPlugin {
  constructor(sls, options) {
    this.sls = sls;
    this.stage = options.stage;
    this.verbose = options.v;
    this.originalServicePath = this.sls.config.servicePath;

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
    const slsFunctionRef = this.sls.service.functions;
    return optionUtils.build(ignitorOptions, this.slsFunctions);

   
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
    
    this.sls.cli.log('Wrapping ignitor functions...');
    const names = Object.keys(this.sls.service.functions).filter((name) => functions.indexOf(name) !== -1);
    for (const name of names) {
      const { handler } = this.sls.service.functions[name];
      this.sls.cli.log(`Wrapped ${handler}`);

      // update handler path
      this.sls.service.functions[name].handler = build.wrap(name, handler, undefined, this.verbose);
    }
  }

  deploy() {
    const { functions } = this.options();

    this.sls.cli.log(`Igniting source(s) ${JSON.stringify(functions)}`);
    for (const func of functions) {
      setTimeout(invokeRemote(func, this.stage), 1500);
    }
  }
  
}

module.exports = IgnitorPlugin;
