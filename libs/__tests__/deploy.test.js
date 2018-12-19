const utils = require('../utils');
const deploy = require('../deploy').deploy;

jest.mock('../utils');
jest.useFakeTimers();

const MOCK_EVENT = {
  ignitor: true,
};

const EXPECTED_CALL = `sls invoke -f hello --data '${JSON.stringify(MOCK_EVENT)}' -s beta`

test('deploy is scheduled and called', () => {
  deploy('hello', MOCK_EVENT, 'beta');
  jest.advanceTimersByTime(1500);
  expect(setTimeout).toHaveBeenCalledTimes(1);
  expect(utils.cli).toHaveBeenCalledWith(EXPECTED_CALL);
});
