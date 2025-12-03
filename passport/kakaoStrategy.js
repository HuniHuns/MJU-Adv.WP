const kakaoStrategy = require('passport-kakao').Strategy;
const User = require('../models/user');

module.exports = new kakaoStrategy(
  {
    clientID: process.env.KAKAO_ID,
    callbackURL: '/auth/kakao/callback',
  },
  async (accessToken, refreshToken, profile, done) => {
    console.info('___new KakaoStrategy()');
    console.log('___kakao profile', profile);

    try {
      const exUser = await User.findOne({
        where: { snsId: profile.id, provider: 'kakao' },
      });
      if(exUser) {
        console.log('___kakao existing user', exUser);
        done(null, exUser);
      } else {
        const newUser = await User.create({
          email: profile._json?.kakao_account?.email,
          nickname: profile.displayName,
          provider: 'kakao',
          snsId: profile.id,
        });
        console.log('___kakao new user', newUser);
        done(null, newUser);
      }
    } catch (err) {
      console.error(err);
      done(err);
    }
  }
);