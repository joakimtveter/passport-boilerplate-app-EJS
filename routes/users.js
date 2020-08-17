const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");

// User model
const User = require("../models/User");

// Render Login Page
router.get("/login", (req, res) => res.render("login"));

// Render Register Page
router.get("/register", (req, res) => res.render("register"));

// Handle Registration Form
router.post("/register", (req, res) => {
  const { name, email, password, password2 } = req.body;

  let errors = [];

  // Check required fields
  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please fill in all fields" });
  }

  //Check passwords match
  if (password !== password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  // Check password length
  if (password.length < 8) {
    errors.push({ msg: "Password should be at least 8 characters long" });
  }

  if (errors.length > 0) {
    res.render("register", { errors, name, email, password, password2 });
  } else {
    User.findOne({ email: email }).then((user) => {
      if (user) {
        //User Exists
        errors.push({ msg: "Email is already registerd" });
        res.render("register", { errors, name, email, password, password2 });
      } else {
        const newUser = new User({
          name,
          email,
          password,
        });
        // Hash password
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            //Set password to hashed password
            newUser.password = hash;
            // Save User
            newUser
              .save()
              .then((user) => {
                req.flash("success_msg", "You are now registered, please log in!");
                res.redirect("/users/login");
              })
              .catch((err) => console.log(err));
          })
        );
      }
    });
  }
});

// Login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

// Logout
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You where successfully logged out!");
  res.redirect("/users/login");
});

module.exports = router;
