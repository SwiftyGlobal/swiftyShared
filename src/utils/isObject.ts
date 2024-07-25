export const isObject = (value: any): boolean => {
  return !Array.isArray(value) && typeof value === 'object' && value !== null;
};
