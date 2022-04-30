const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local');
const mongoose = require('mongoose');
const userDDBModel = require('../models/UserDDB');
const keys = require('../config/keys');

// get the model class
const User = mongoose.model('users');

// store the data to session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// take out the user id from session
passport.deserializeUser((id, done) => {
  const esistingUserFromDDB = await userDDBModel.get({"id": id});
  if(esistingUserFromDDB) {
    console.log("line 20 user: ", esistingUserFromDDB)
    done(null, esistingUserFromDDB);
  }

  // User.findById(id).then(user => {
  //   done(null, user);
  // });
});


// configure the GoogleStrategy
// and if succeed, execute the async function to load or create user
passport.use(
  new LocalStrategy(async function verify(username, password, done) {
    // const existingUser = await User.findOne({ googleId : "103805923715121791269" });
    const esistingUserFromDDB = await userDDBModel.scan("googleId").eq("103805923715121791269").exec();
    console.log("mongodb is finished line 29");
    console.log("ddb processing starting line 20");

    // const esistingUserFromDDB = await userDDBModel.get({"googleId": "103805923715121791269"});
    // const esistingUserFromDDB = await userDDBModel.scan("googleId").eq("103805923715121791269").exec();

    // console.log("ddb processing done and get user googleid: ", esistingUserFromDDB[0].googleId);

    // console.log("existing user's id type: ", typeof(existingUser.id));
    // console.log("existing user's id in mongodb: ", existingUser.id);
    // const existingUserMongo = await User.findById(existingUser.id);
    // console.log("existing user's id type in mongodbbbb: ", typeof(mongoose.Types.ObjectId(existingUser.id)));

    if(esistingUserFromDDB[0]) {
      console.log("line 52 user: ", esistingUserFromDDB[0])
      // we already have a record with the given profile ID
      done(null, esistingUserFromDDB[0]);
      console.log("done");
    }
  })
);
