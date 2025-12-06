const express = require('express');
const bcrypt = require('bcrypt');

const passport = require('../passport/index.js');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const User = require('../models/user');

const router = express.Router();

// local 회원가입
router.post('/join', isNotLoggedIn, async (req, res, next) => {
  const { email, nickname, password } = req.body;

  try{
    const exUser = await User.findOne({ 
      where: { email },
      paranoid: false });
    if(exUser) {
      return res.redirect(`/join?error=이미 존재하는 이메일입니다.`);
    }
    console.info('___User.create(): ' + nickname);
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      email,
      nickname,
      password: hash,
    });
    return res.redirect('/');
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

// local 로그인
router.post('/login', isNotLoggedIn, (req, res, next) => {
  passport.authenticate('local', (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      return res.redirect(`/login?loginError=${info.message}`);
    }

    console.info('___req.login()');
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      return res.redirect('/');
    });
  })(req, res, next);
});

// logout
router.get('/logout', isLoggedIn, (req, res) => {
  req.logout(() => {
    req.session.destroy();
    res.redirect('/');
  });
});

// kakao 로그인
router.get('/kakao', passport.authenticate('kakao'));

// kakao redirect
router.get(
  '/kakao/callback',
  passport.authenticate('kakao', {
    failureRedirect: '/login?loginError=카카오로그인실패',
  }),
  (req, res) => {
    res.redirect('/');
  }
);

module.exports = router;