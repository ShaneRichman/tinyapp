function generateRandomString(numChars) {
  let string = "";
  let charOptions = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < numChars; i++) {
    string += charOptions.charAt(Math.floor(Math.random() * charOptions.length));
  }
  return string;
}

module.exports = {
  generateRandomString: generateRandomString
};