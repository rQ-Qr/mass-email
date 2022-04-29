const dynamoose = require('dynamoose');
const { Schema } = dynamoose;

// create a new model class
const ratingSchema = new Schema({
  "ratingId": String,
  "rating": String
});

// load the new schema to mongoose
module.exports =  dynamoose.model('rating', ratingSchema);