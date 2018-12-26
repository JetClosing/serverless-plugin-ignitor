const deploy = require('../deploy');
const { cli } = require('../fileUtils');

jest.mock('../fileUtils');

describe('deploy', () => {
  test('default path', () => {
    deploy.deploy('hello', { ignitor: true }, 'beta');
    jest.advanceTimersByTime(2000);
    expect(cli).toHaveBeenCalledWith(`sls invoke -f hello --data '{"ignitor":true}' -s beta`);
  });

  test('no functionName', () => {
    expect.assertions(1);
    try {
      deploy.deploy(undefined, { ignitor: true }, 'beta');
      jest.advanceTimersByTime(2000);
    } catch (e) {
      expect(e.message).toEqual('No functionName provided to deploy with');
    }
  });

  test('no event', () => {
    expect.assertions(1);
    try {
      deploy.deploy('hello', undefined, 'beta');
      jest.advanceTimersByTime(2000);
    } catch (e) {
      expect(e.message).toEqual('No event provided to deploy with');
    }
  });

  test('no stage', () => {
    expect.assertions(1);
    try {
      deploy.deploy('hello', { ignitor: true });
      jest.advanceTimersByTime(2000);
    } catch (e) {
      expect(e.message).toEqual('No stage provided to deploy with');
    }
  });
});