const express = require('express');
const sequelize = require('sequelize');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { User, Game, Vote, Comment } = require('../models');

const router = express.Router();

// req.user의 사용자 데이터를 넌적스 템플릿에서 이용가능하도록 res.locals에 저장
router.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// 1. 메인 페이지
router.get('/', async (req, res, next) => {
  try {
    // AI 최신 게임
    const aiGame = await Game.findOne({
      where: { creatorType: 'ai' },
      order: [['createdAt', 'DESC']],
      include: [{ model: User, attributes: ['nickname'] }],
    });

    // 유저 인기 게임 (투표수 합계순)
    const userGame = await Game.findOne({
      where: { creatorType: 'user' },
      order: [
        [sequelize.literal('countA + countB'), 'DESC'],
        ['createdAt', 'DESC']
      ],
      include: [{ model: User, attributes: ['nickname'] }],
    });

    res.render('main', { 
        title: 'VS 밸런스 게임', 
        aiGame, 
        userGame 
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 2. 로그인 & 회원가입 페이지
router.get('/login', isNotLoggedIn, (req, res) => {
  res.render('login', { title: '로그인' });
});

router.get('/join', isNotLoggedIn, (req, res) => {
  res.render('join', { title: '회원가입' });
});

// 3. 게임 목록
router.get('/game/list', async (req, res, next) => {
  try {
    // 10개씩 끊어서 페이징
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const { count, rows: games } = await Game.findAndCountAll({
      order: [['createdAt', 'DESC']],  // 최신순으로 정렬
      limit,
      offset,
      include: [{ model: User, attributes: ['nickname']}],
    });

    res.render('gameList', {
      title: '전체 게임 목록',
      games,
      currentPage: page,  // 현재 페이지
      totalPage: Math.ceil(count / limit),  // 총 페이지 수
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 4. 게임 생성 화면
router.get('/game/create', isLoggedIn, (req, res) => {
  res.render('gameForm', { title: '새 게임 만들기' });
});

// 5. 게임 상세 페이지
router.get('/game/:id', async (req, res, next) => {
  try {
    const game = await Game.findOne({
      where: { id: req.params.id },
      include: [
        { model: User, attributes: ['nickname'] },
        {
          model: Comment,
          include: [{ model: User, attributes: ['nickname'] }],
          order: [['createdAt', 'ASC']],
        }
      ]
    });

    if (!game) {
      return res.status(404).send('존재하지 않는 게임입니다.');
    }

    // 사용자가 투표했는지 확인
    let userVote = null;
    if (req.user) {
      userVote = await Vote.findOne({
        where: { GameId: game.id, UserId: req.user.id },
      });
    }

    res.render('gameDetail', {
      title: game.title,
      game,
      userVote,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 6. 유저 정보 페이지
router.get('/myinfo', isLoggedIn, async (req, res, next) => {
  try{
    const myVotes = await Vote.findAll({
      where: { UserId: req.user.id },
      include: [{ model: Game }],
      order: [['createdAt', 'DESC']],
    });

    res.render('myInfo', {
      title: '내 정보',
      myVotes,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});


module.exports = router;
