const keys = require('../config/keys');
const stripe = require('stripe')(keys.stripeSecretKey);
const requireLogin = require('../middlewares/requireLogin');
const dynamooseclient = require('./dynamooseclient');
const ratingModel = require('./ratingModel');

module.exports = app => {
  // first check if login by requireLogin middleware
  app.post('/api/stripe', requireLogin, async (req, res) => {
    // confirm the payment with stripe
    const charge = await stripe.charges.create({
      amount: 500,
      currency: 'usd',
      description: '$5 for 5 credits',
      source: req.body.id
    });
    // add the credit
    req.user.credits += 5;
    // save the data to mongoDB and get persisted
    const user = await req.user.save();
    console.log("Starting processing rating....")
    const rating = new ratingModel({
      "ratingId": "testratingid",
      "rating": "excellent"
    })
    const ratinginstance = await rating.save();
    console.log("Rating saved to ddb: ", ratinginstance.rating)
    // return the updated user data
    res.send(user);
  });
};


const survey = new Rating({
  title,
  subject,
  body,
  // split the recipients and store as an object
  recipients: recipients.split(',').map(email => ({email: email.trim()})),
  _user: req.user.id,
  dateSent: Date.now()
});