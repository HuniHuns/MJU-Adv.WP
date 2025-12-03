const express = require('express');

const { Game, Vote, Comment } = require('../models');
const { isLoggedIn } = require('./middlewares');

const router = express.Router();

// 1. 밸런스 게임 생성 (POST /game)
router.post('/', isLoggedIn, async (req, res, next) => {
  try {
    const { title, optionA, optionB } = req.body;

    // 유저가 만드는 밸런스 게임 -> creatorType = 'user'
    await Game.create({
      title,
      optionA,
      optionB,
      creatorType: 'user',
      UserId: req.user.id,
    });

    res.redirect(`/game/list`); // 게임 생성 후 게임 목록 페이지로 이동
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 2. 선택지 투표 기능 (POST /game/:id/vote)
router.post('/:id/vote', isLoggedIn, async (req, res, next) => {
  try{
    const gameId = req.params.id;
    const userId = req.user.id;
    const { choice } = req.body; // 'A' 또는 'B'

    console.log(`[투표 요청] GameId: ${gameId}, User: ${userId}, Choice: ${choice}`); // 로그 확인용

    // 중복 투표 확인 : Vote 모델을 통해 이미 투표했는지 확인
    const existingVote = await Vote.findOne({
      where: { GameId: gameId, UserId: userId },
    });

    if(existingVote) {
      // 이미 투표했다면 400 에러 출력
      return res.status(400).send('이미 투표하셨습니다.');
    }

    // 투표 기록 생성(unique 제약 조건을 위함)
    await Vote.create({
      choice,
      GameId: gameId,
      UserId: userId,
    });

    // 게임 테이블의 카운트 수 증가
    const game = await Game.findOne({ where: { id: gameId } });
    if(choice === 'A') {
      await game.increment('countA');
      console.log('📈 A 카운트 증가');
    } else if(choice === 'B') {
      await game.increment('countB');
      console.log('📈 B 카운트 증가');
    }

    res.redirect(`/game/${gameId}`); // 성공 응답
  } catch(error) {
    console.error(error);
    next(error);
  }
});

// 3. 댓글 작성 (POST /game/:id/comment)
router.post('/:id/comment', isLoggedIn, async (req, res, next) => {
  try {
    const gameId = req.params.id;
    const userId = req.user.id;
    const { content } = req.body;

    // 유저가 이 게임에 투표했는지 확인
    const myVote = await Vote.findOne({
      where: { GameId: gameId, UserId: userId },
    });

    await Comment.create({
      content,
      choice: myVote ? myVote.choice : null, // A 또는 B, 없으면 null
      GameId: gameId,
      UserId: userId,
    });

    res.redirect(`/game/${gameId}`); // 댓글 작성 후 새로고침
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 4. 댓글 수정 (PUT /game/comment/:id)
// 5. 댓글 삭제 (DELETE /game/comment/:id)
router.route('/comment/:id', isLoggedIn)
  // 댓글 수정 기능 구현
  .put(async (req, res, next) => {
    try {
      // 댓글 조회 및 권한 확인
      const comment = await Comment.findOne({ where: { id: req.params.id } });

      if (!comment) {
        return res.status(404).send('존재하지 않는 댓글입니다.');
      }
      if (comment.UserId !== req.user.id) {
        return res.status(403).send('댓글 수정 권한이 없습니다.');
      }

      // 댓글 수정
      await Comment.update(
        { content: req.body.content },
        { where: { id: req.params.id } }
      );

      // 성공 시 fe에서 location.reload()로 새로고침
      res.send('댓글이 수정되었습니다.');
    } catch (error) {
      console.error(error);
      next(error);
    }
  })
  // 댓글 삭제 기능 구현
  .delete(async (req, res, next) => {
    try {
      // 댓글 조회 및 권한 확인
      const comment = await Comment.findOne({ where: { id: req.params.id } });

      if (!comment) {
        return res.status(404).send('존재하지 않는 댓글입니다.');
      }
      if (comment.UserId !== req.user.id) {
        return res.status(403).send('댓글 삭제 권한이 없습니다.');
      }

      // 댓글 삭제
      await Comment.destroy({ where: { id: req.params.id } });

      // 성공 시 fe에서 location.reload()로 새로고침
      res.send('댓글이 삭제되었습니다.');
    } catch (error) {
      console.error(error);
      next(error);
    }
  });

module.exports = router;