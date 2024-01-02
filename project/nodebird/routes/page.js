const express = require('express');
const {renderProfile, renderJoin, renderMain} = require('../controller/page');

const router = express.Router();

// 공통으로 사용할 경우 res.locals를 사용한다.
router.use((req, res, next) => {
    res.locals.user = null;
    res.locals.followerCount = 0;
    res.locals.followingCount = 0;
    res.locals.followerIdList = [];
    next();
});

// 라우터의 미들웨어를 다른 곳에서 불러오고 있다.
//아래와 같이 라우터 마지막에 위치해 클라이언트에 응답을 보내는 미들웨어를 컨트롤러한다.
router.get('/profile', renderProfile);
router.get('/join', renderJoin);
router.get('/', renderMain);

module.exports = router;