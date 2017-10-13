function generateRandomString(numChars) {
  let string = "";
  let charOptions = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < numChars; i++) {
    string += charOptions.charAt(Math.floor(Math.random() * charOptions.length));
  }
  return string;
}

function authenticate(email, password, users) {
  for (user in users) {
    if (users[user].email === email && users[user].password === password) {
      return users[user];
    }
  }
  return undefined;
}

function forbiddenIfNotLoggedIn(req, res, next) {
  if (res.locals.user === undefined) {
    res.sendStatus(403);
  } else {
    next();
  }
}

function isThisYours(req, res, next) {
  if (res.locals.user === undefined) {
    res.sendStatus(403);
  } else {
    next();
  }
}

function getById(id, users) {
  for (user in users) {
    if (users[user].id === id) {
      return users[user];
    }
  }
  return undefined;
}

module.exports = {
  generateRandomString: generateRandomString,
  authenticate: authenticate,
  forbiddenIfNotLoggedIn: forbiddenIfNotLoggedIn,
  getById: getById,
  isThisYours: isThisYours
};