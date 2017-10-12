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


// FIX REGISTER WITH EMPTY PASSWORD


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.cookies["userID"]]
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
      res.redirect("/urls");
    }
  }
});

app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.cookies["userID"]]
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
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls/" + shortURL);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.get("/urls/:id", (req, res) => {
  const tinyurl = req.params.id;
  let templateVars = {
    shortURL: tinyurl,
    longURL: urlDatabase[tinyurl],
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});