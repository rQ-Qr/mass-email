const dynamooseclient = require('./dynamooseclient');


// create a new model class
const ratingSchema = new dynamooseclient.Schema({
  "ratingId": String,
  "rating": String
});

// load the new schema to mongoose
const ratingModel = dynamooseclient.model('Ratings', ratingSchema);
module.exports = ratingModel;