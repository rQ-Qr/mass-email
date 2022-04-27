const mongoose = require('mongoose');
const { Schema } = mongoose;

// create a new model class to store the recipients and if responded 
const recipientSchema = new Schema({
  email: String,
  responded: { type: Boolean, default: false }
});

module.exports = recipientSchema;
