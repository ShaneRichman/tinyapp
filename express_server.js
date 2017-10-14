var cookieSession = require('cookie-session')
var express = require("express");
const userServices = require("./index");
const bcrypt = require('bcrypt');
var app = express()
var PORT = process.env.PORT || 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieSession({
  name: 'session',
  keys: ["key1,", "key2"]
}))

const urlDatabase = {
  "b2xVn2": {
    url: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    url: "http://www.google.com",
    userID: "user2RandomID"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
}

app.use((req, res, next) => {
  res.locals.user = userServices.getById(req.session.user_id, users);
  next();
});

app.use('/urls', (req, res, next) => {
  userServices.forbiddenIfNotLoggedIn(req, res, next);
});

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const usersURLS = userServices.findUsersURLS(urlDatabase, req.session["user_id"])
  let templateVars = {
    urls: usersURLS,
    user: users[req.session["user_id"]]
  };
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.session["user_id"]]
  };
  if (templateVars.user) {
    res.redirect("/urls");
  } else {
    res.render("register_index", templateVars);
  }
});


app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.session["user_id"]]
  };
  if (templateVars.user) {
    res.redirect("/urls");
  } else {
    res.render("login_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: users[req.session["user_id"]]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const tinyurl = req.params.id;
  if (!!urlDatabase[tinyurl]) {
    if (urlDatabase[req.params.id].userID === req.session["user_id"]) {
      let templateVars = {
        shortURL: tinyurl,
        longURL: urlDatabase[tinyurl].url,
        user: users[req.session["user_id"]]
      };
      res.render("urls_show", templateVars);
    } else {
      res.status(403);
      res.render("notAllowed");
    }
  } else {
    res.status(404);
    res.render("notFound");
  }
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    let longURL = urlDatabase[req.params.shortURL].url;
    res.redirect(longURL);
  } else {
    res.status(404);
    res.render("notFound");
  }
});

app.get("/notAllowed", (req, res) => {
  res.status(403);
  res.render("notAllowed");
});

app.get("/notFound", (req, res) => {
  res.status(404);
  res.render("notFound");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (email === "" || password === "") {
    res.status(400);
    res.send("You need both an Email and a password. <a href=/register >try again</a>");
  } else {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = userServices.authenticate(email, hashedPassword, users);
    if (user) {

      res.send("already made. <a href=/register >try again</a>");
    } else {
      const userID = userServices.generateRandomString(6);
      users[userID] = {
        id: userID,
        email: req.body.email,
        password: hashedPassword
      }
      req.session.user_id = userID;
      res.locals.user = userServices.getById(req.session.user_id, users);
      res.redirect("/urls");
    }
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = userServices.authenticate(email, password, users);
  if (user) {
    req.session.user_id = user.id;
    res.locals.user = userServices.getById(req.session["user_id"], users);
    res.redirect("/urls");
  } else {
    res.status(403);
    res.redirect("/notFound");
  }
});

app.post("/urls", (req, res) => {
  const shortURL = userServices.generateRandomString(6);
  urlDatabase[shortURL] = {
    url: req.body.longURL,
    userID: req.session.user_id
  }
  res.redirect("/urls/" + shortURL);
});

app.post("/urls/:id/delete", (req, res) => {
  if (urlDatabase[req.params.id].userID === req.session["user_id"]) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  } else {
    res.redirect("/notAllowed");
  }
});

app.post("/urls/:id", (req, res) => {
  if (urlDatabase[req.params.id].userID === req.session["user_id"]) {
    urlDatabase[req.params.id].url = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.redirect("/urls/" + req.params.id);
  }
});

app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});