const mongoose = require('mongoose');
const { Schema } = mongoose;

// create a new model class
const userSchema = new Schema({
  googleId: String,
  credits: { type: Number, default: 0 }
});

// load the new schema to mongoose
mongoose.model('users', userSchema);
