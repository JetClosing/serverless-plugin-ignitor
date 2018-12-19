const utils = require('./utils');

const DEPLOYMENT_DELAY = 1500;

const invoke = (functionName, event, stage) => () => {
  utils.cli(`sls invoke -f ${functionName} --data '${event}' -s ${stage}`);
};

const deploy = (functionName, event, stage) => {
  const stringy = JSON.stringify(event);
  setTimeout(invoke(functionName, stringy, stage), DEPLOYMENT_DELAY);
};

module.exports = {
  deploy: deploy,
};
