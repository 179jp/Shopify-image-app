export const JsonFormat = (array) => {
  const jsonString = JSON.stringify(array);
  const escapedString = jsonString.replace(/"/g, '\\"');
  console.log(array, escapedString);
  return escapedString;
};
