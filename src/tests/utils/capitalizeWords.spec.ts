import { capitalizeWords } from '../../utils';

describe('capitalizeWords', () => {
  it('capitalizes each word in a normal sentence', () => {
    expect(capitalizeWords('hello world')).toBe('Hello World');
  });

  it('handles multiple spaces between words', () => {
    expect(capitalizeWords('hello   world')).toBe('Hello   World');
  });

  it('returns an empty string as is', () => {
    expect(capitalizeWords('')).toBe('');
  });

  it('capitalizes mixed-case strings correctly', () => {
    expect(capitalizeWords('hElLo WoRLd')).toBe('Hello World');
  });

  it('returns null as is', () => {
    expect(capitalizeWords(null)).toBe(null);
  });

  it('returns undefined as is', () => {
    expect(capitalizeWords(undefined)).toBe(undefined);
  });

  it('returns number as is', () => {
    expect(capitalizeWords(123)).toBe(123);
  });

  it('returns object as is', () => {
    const obj = { key: 'value' };
    expect(capitalizeWords(obj)).toBe(obj);
  });

  it('handles single word', () => {
    expect(capitalizeWords('hello')).toBe('Hello');
  });
});
