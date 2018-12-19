const memo = require('../memo').memo;

let internalCaller = jest.fn();

beforeEach(() => {
  internalCaller = jest.fn();
});

const example = memo((leftOperand, rightOperand) => {
  internalCaller(leftOperand, rightOperand);
  return leftOperand + rightOperand;
});

describe('memo', () => {
  test('gets initial value', () => {
    const response = example(1, 3);
    expect(response).toEqual(4);
    expect(internalCaller).toHaveBeenCalledWith(1, 3);
  });

  test('get memoized value', () => {
    const response = example(1, 3);
    expect(response).toEqual(4);
    expect(internalCaller).not.toHaveBeenCalled();
  });
});