var express = require("express");
var cookieParser = require('cookie-parser')
var app = express()
app.use(cookieParser())
var PORT = process.env.PORT || 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
  extended: true
}));

var shrinkURL = require("./index");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = shrinkURL.generateRandomString(6);
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
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});