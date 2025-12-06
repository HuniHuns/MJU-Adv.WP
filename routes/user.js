const express = require('express');
const { isLoggedIn } = require('./middlewares');
const { User } = require('../models');

const router = express.Router();

// 1. 닉네임 수정 (PATCH /user/nickname)
router.patch('/nickname', isLoggedIn, async (req, res, next) => {
  try{
    // 닉네임 유효성 검사(null값 체크)
    if (!req.body.nickname || req.body.nickname.trim() === '') {
      return res.status(400).send('닉네임을 입력하세요.');
    }

    await User.update(
      { nickname: req.body.nickname },
      { where: { id: req.user.id } }
    );

    res.send('닉네임이 성공적으로 수정되었습니다.');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 2. 회원 탈퇴 (DELETE /user)
router.delete('/', isLoggedIn, async (req, res, next) => {
  try {
    await User.destroy({ 
      where: { id: req.user.id },
    force: true });

    req.logout(() => {
      req.session.destroy();
      res.send('회원 탈퇴가 완료되었습니다.');
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;