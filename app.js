require("./config/db");
const express = require('express');

const session = require("express-session");
const passport = require("passport");
require("dotenv").config();

require("./config/passport");

const app = express();

const cookieParser = require('cookie-parser');
const path = require('path');
const userModel = require("./models/user");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());


app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(async (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    res.locals.user = req.user;
    return next();
  }

  const token = req.cookies.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userModel.findOne({ email: decoded.email });
      if (user) {
        req.user = user;
        res.locals.user = user;
      }
    } catch (err) {
      console.error("JWT error:", err);
    }
  }

  next();
});



app.get("/", (req,res) => {
  res.render("index", { user: req.user });
})

app.post("/create", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      // Prevent duplicate if the user already exists via Google
      return res.send("User already exists. Try logging in.");
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const createdUser = await userModel.create({
      username,
      email,
      password: hash
    });

     res.status(200).json({ message: "User created. Please login." });
    //const token = jwt.sign({ email }, process.env.JWT_SECRET);//
   // res.cookie("token", token);//
    //res.redirect("/"); //
  } catch (err) {
    console.error(err);
    res.send("Something went wrong during registration.");
  }
});

app.post("/login", async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });

    if (!user || !user.password) {
      return res.send("This account was created using Google. Please use Google login.");
    }

    const match = await bcrypt.compare(req.body.password, user.password);
    if (match) {
      const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET);
      res.cookie("token", token);
      res.redirect("/");
    } else {
      res.send("Incorrect password");
    }
  } catch (err) {
    console.error(err);
    res.send("Something went wrong during login.");
  }
});



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
   res.cookie("token", "");
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

app.get("/profile", isLoggedIn, (req, res) => {
  res.send("Hello " + req.user.username);
});


function isLoggedIn(req, res, next) {
  // If authenticated with Passport (Google)
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }

  // Check for JWT token in cookies
  const token = req.cookies.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Optionally fetch full user details from DB:
      userModel.findOne({ email: decoded.email }).then(user => {
        if (!user) return res.redirect("/");

        req.user = user; // ✅ attach full user object to request
        return next();
      });
    } catch (err) {
      console.error("JWT Verification Failed:", err);
      return res.redirect("/");
    }
  } else {
    return res.redirect("/");
  }
}


app.listen(3000);