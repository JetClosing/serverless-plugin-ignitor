const { ignitor } = require('../ignitor');

const PING_EVENT = {
  ignitor: true,
};

const ORIGINAL_EVENT = {
  source: 'aws:events',
};

describe('ignitor', () => {
  test('ping test', () => {
    const original = jest.fn();
    const callback = jest.fn();
  
    ignitor(original)(PING_EVENT, null, callback);
    expect(original).not.toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith(null, 'pinged');
  });

  test('original', () => {
    const original = jest.fn((e, t, c) => c(null, 'success'));
    const callback = jest.fn();
  
    ignitor(original)(ORIGINAL_EVENT, null, callback);
    expect(original).toHaveBeenCalledWith(ORIGINAL_EVENT, null, callback);
    expect(callback).toHaveBeenCalledWith(null, 'success');
  });
});
