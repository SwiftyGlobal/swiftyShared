export const decimalToAmerican = (value: number) => {
  let new_value = '';
  if (value > 2) {
    new_value = `+${Math.round((value - 1) * 100)}`;
  } else if (value < 2) {
    new_value = `-${Math.round(100 / (value - 1))}`;
  } else {
    // evens
    new_value = '+100';
  }
  return new_value;
};
