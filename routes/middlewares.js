// isLoggedIn 함수
// 로그인된 상태이면 다음 미들웨어로 연결
exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(403).send(`
      <script>
        alert('로그인을 먼저 진행해주세요.');
        location.href = '/login';
      </script>
    `);
  }
};

// isNotLoggedIn 함수
// 로그인되지 않은 상태이면 다음 미들웨어로 연결
exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next();
  } else {
    const message = encodeURIComponent('이미 로그인된 상태입니다.');
    res.redirect('/');
  }
};