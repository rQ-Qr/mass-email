const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
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
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: '/auth/google/callback',
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
        const existingUser = await User.findOne({ googleId : profile.id });
        if(existingUser) {
          // we already have a record with the given profile ID
          done(null, existingUser);
        }
        else {
          // we don't have a user record with this ID, make a new record
          const user = new User({ googleId: profile.id }).save();
          done(null, user);
        }
        // the done function is used to send the user to passport.serializeUser
    }
  )
);
