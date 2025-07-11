require("./config/db");
const express = require('express');

const session = require("express-session");
const passport = require("passport");
require("dotenv").config();

require("./config/passport");

const app = express();

const path = require('path');

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());


app.get("/", (req,res) => {
  res.render("index", { user: req.user });
})

app.get("/academic", isLoggedIn, (req,res) => {
  res.render("academic", { user: req.user });
})

app.get("/campus", (req,res) => {
  res.render("campus", { user: req.user });
})

app.get("/know", (req,res) => {
  res.render("know", { user: req.user });
})

app.get("/logout", (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.redirect("/");
    });
  });
});


app.get("/auth/google", passport.authenticate("google", {
  scope: ["profile", "email"],
  prompt: "select_account" // forces account chooser every time
}));

app.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/");
  }
);

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}


app.listen(3000);