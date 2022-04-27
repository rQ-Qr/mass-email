const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local');
const mongoose = require('mongoose');
const keys = require('../config/keys');

// get the model class
const User = mongoose.model('users');

// store the data to session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// take out the user id from session
passport.deserializeUser((id, done) => {
  User.findById(id).then(user => {
    done(null, user);
  });
});


// configure the GoogleStrategy
// and if succeed, execute the async function to load or create user
passport.use(
  new LocalStrategy(async function verify(username, password, done) {
    const existingUser = await User.findOne({ googleId : "103805923715121791269" });
    if(existingUser) {
      // we already have a record with the given profile ID
      done(null, existingUser);
      console.log("done");
    }
  })
);
