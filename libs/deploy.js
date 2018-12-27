const { cli } = require('./fileUtils');

const POST_DEPLOY_DELAY = 1500;

const buildArgs = (functionName, event, stage) => () => {
  if (!functionName) {
    throw new Error('No functionName provided to deploy with');
  }
  if (!event) {
    throw new Error('No event provided to deploy with');
  }
  if (!stage) {
    throw new Error('No stage provided to deploy with');
  }
  cli(`sls invoke -f ${functionName} --data '${JSON.stringify(event)}' -s ${stage}`);
};

const deploy = (functionName, event, stage) => setTimeout(buildArgs(functionName, event, stage), POST_DEPLOY_DELAY);

module.exports = {
  deploy,
};
