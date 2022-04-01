const mongoose = require('mongoose');
const { Schema } = mongoose;
const RecipientSchema = require('./Recipient');

// create a new model class
const surveySchema = new Schema({
  title: String,
  body: String,
  subject: String,
  // refer to RecipientSchema
  recipients: [RecipientSchema],
  yes: { type: Number, default: 0 },
  no: { type: Number, default: 0 },
  // refer to user id
  _user: { type: Schema.Types.ObjectId, ref: 'User' },
  dateSent: Date,
  lastResponded: Date
});

// load the new schema to mongoose
mongoose.model('surveys', surveySchema);
