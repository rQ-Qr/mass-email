const express = require('express');
const mongoose = require('mongoose');
const cookieSession = require('cookie-session');
const passport = require('passport');
const bodyParser = require('body-parser');
const keys = require('./config/keys');
require('./models/User');
require('./models/Survey');
require('./services/passport');

mongoose.connect(keys.mongoURI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  });

// create a new application
const app = express();

app.use(bodyParser.json());

// below are three middlewares
// wire up the cookieSession module to set the cookie
app.use(
  cookieSession({
    maxAge: 30 * 24 * 60 * 60 *1000,
    keys: [keys.cookieKey]
  })
);
// initialize the passport
app.use(passport.initialize());
// load the cookie into passport
app.use(passport.session());

// load all routers
require('./routes/authRoutes')(app);
require('./routes/billingRoutes')(app);
require('./routes/surveyRoutes')(app);

if(process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  const path = require('path');
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// using distributed port number in production environment
const PORT = process.env.PORT || 5000;
// node will listen to the port
app.listen(PORT);
