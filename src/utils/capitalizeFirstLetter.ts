/**
 * @description - Capitalize first letter of the string
 * @example
 * capitalizeFirstLetter('hello') => 'Hello'
 * capitalizeFirstLetter('world') => 'World'
 */
export const capitalizeFirstLetter = (string: string): string => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};