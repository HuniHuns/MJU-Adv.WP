const passport = require('passport');
const localStrategy = require('./localStrategy');
const kakaoStrategy = require('./kakaoStrategy');
const User = require('../models/user');

passport.serializeUser((user, done) => {
  console.log('___passport.serializeUser()___');
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  console.log('___passport.deserializeUser()___');

  User.findOne({ where: { id } })
  .then((user) => done(null, user))
  .catch((err) => done(err));
});

passport.use(localStrategy);
passport.use(kakaoStrategy);

module.exports = passport;