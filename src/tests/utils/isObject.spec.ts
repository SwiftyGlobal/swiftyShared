import { isObject } from '../../utils';

describe('isObject', () => {
  it('should return true for plain object', () => {
    expect(isObject({ key: 'value' })).toBe(true);
  });

  it('should return false for null', () => {
    expect(isObject(null)).toBe(false);
  });

  it('should return false for array', () => {
    expect(isObject([1, 2, 3])).toBe(false);
  });

  it('should return false for string', () => {
    expect(isObject('text')).toBe(false);
  });

  it('should return false for number', () => {
    expect(isObject(123)).toBe(false);
  });

  it('should return false for boolean', () => {
    expect(isObject(true)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isObject(undefined)).toBe(false);
  });

  it('should return true for object created with new Object()', () => {
    expect(isObject(new Object())).toBe(true);
  });

  it('should return true for object with prototype', () => {
    class MyClass {}
    expect(isObject(new MyClass())).toBe(true);
  });
});
