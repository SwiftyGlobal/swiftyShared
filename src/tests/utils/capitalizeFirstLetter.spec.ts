import { capitalizeFirstLetter } from '../../utils';

describe('capitalizeFirstLetter', () => {
  it('should capitalize the first letter of a lowercase word', () => {
    expect(capitalizeFirstLetter('hello')).toBe('Hello');
  });

  it('should not change the first letter if it is already capitalized', () => {
    expect(capitalizeFirstLetter('World')).toBe('World');
  });

  it('should work with single-character strings', () => {
    expect(capitalizeFirstLetter('a')).toBe('A');
    expect(capitalizeFirstLetter('Z')).toBe('Z');
  });

  it('should handle empty strings gracefully', () => {
    expect(capitalizeFirstLetter('')).toBe('');
  });

  it('should not change non-letter characters', () => {
    expect(capitalizeFirstLetter('1hello')).toBe('1hello');
    expect(capitalizeFirstLetter('-test')).toBe('-test');
  });

  it('should work with strings that start with whitespace', () => {
    expect(capitalizeFirstLetter(' test')).toBe(' test');
  });
});
