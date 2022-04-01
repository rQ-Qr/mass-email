const passport = require('passport');

module.exports = app => {

  // request the user authentication to google
  app.get(
    '/auth/google',
    passport.authenticate('google', {
      scope: ['profile', 'email']
    })
  );

  // require user details from google and
  // redirect the url with user details to /surveys
  app.get(
    '/auth/google/callback',
    passport.authenticate('google'),
    (req, res) => {
      res.redirect('/surveys');
    }
  );

  // logout
  app.get('/api/logout', (req, res) => {
    req.logout();
    res.redirect("/");
  });

  app.get('/api/current_user', (req, res) => {
    res.send(req.user);
  });
};
