var express = require("express");
var cookieParser = require('cookie-parser')
const userServices = require("./index");
var app = express()
app.use(cookieParser())
var PORT = process.env.PORT || 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
  extended: true
}));

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
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

app.use((req, res, next) => {
  res.locals.user = userServices.getById(req.cookies.user_id, users);
  next();
});

app.use('/urls/new', (req, res, next) => {
  userServices.forbiddenIfNotLoggedIn(req, res, next);
});

// app.use('/urls/:id', (req, res, next) => {
//   userServices.isThisYours(req, res, next);
// });

app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("register_index", templateVars);
});

app.post("/register", (req, res) => {
  const {
    email,
    password
  } = req.body;
  if (email === "" || password === "") {
    res.status(400);
    res.send("You need both an Email and a password. <a href=/register >try again</a>");
  } else {
    const user = userServices.authenticate(email, password, users);
    if (user) {

      res.send("already made. <a href=/register >try again</a>");
    } else {
      const userID = userServices.generateRandomString(6);
      users[userID] = {
        id: userID,
        email: req.body.email,
        password: req.body.password
      }
      res.cookie("user_id", userID);
      res.locals.user = userServices.getById(req.cookies.user_id, users);
      res.redirect("/urls");
    }
  }
});

app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("login_index", templateVars);
});

app.post("/login", (req, res) => {
  const {
    email,
    password
  } = req.body;
  const user = userServices.authenticate(email, password, users);
  if (user) {
    res.cookie("user_id", user.id);
    res.locals.user = userServices.getById(req.cookies["user_id"], users);
    res.redirect("/urls");
  } else {
    res.status(403);
    res.send("Your information didnt match <a href=/login >try again</a>");
  }
});


app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});


app.post("/urls", (req, res) => {
  const shortURL = userServices.generateRandomString(6);
  urlDatabase[shortURL] = {
    url: req.body.longURL,
    userID: req.cookies.user_id
  }
  res.redirect("/urls/" + shortURL);
});

app.post("/urls/:id/delete", (req, res) => {
  if (urlDatabase[req.params.id].userID === req.cookies["user_id"]) {
    delete urlDatabase[req.params.id];
  }
  res.redirect("/urls");
});

app.get("/urls/:id", (req, res) => {
  const tinyurl = req.params.id;
  let templateVars = {
    shortURL: tinyurl,
    longURL: urlDatabase[tinyurl].url,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  if (urlDatabase[req.params.id].userID === req.cookies["user_id"]) {
    urlDatabase[req.params.id].url = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.redirect("/urls/" + req.params.id);
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].url;
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});