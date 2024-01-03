const passport = require('passport');
const local = require('./localStartegy');
const kakao = require('../kakaoStrategy');
const User = require('../models/user');

module.exports = () => {
  passport.serializeUser((user, done) => { // 로그인시 실행되며
    done(null, user.id); // 첫번째 인자는 에러처리, 두번째는 저장하고 싶은 데이터
  }); // 사용자 정보 객체에서 아이디만 추려 세션에 저장

  passport.deserializeUser((id, done) => { // 매 요청시 실행되며
    User.findOne({where: {id}}) // 세션에 저장된 아이디로 사용자 정보를 조회
    .then(user => done(null, user)) // 조회한 정보를 req.user에 저장
    .catch(err => done(err));
  });

  local();
  kakao();
}

/*
전체 프로세스
1. /auth/login 라우터를 통해 로그인 요청
2. 라우터에서 passport.authenticate 메서드 호출
3. 로그인 전략수행
4. 로그인 성공 시 사용자 정보 객체와 함께 req.login 호출
5. req.login 메서드가 passport.serializeUser 호출
6. req.session에 사용자 아이디만 저장해서 세션 생성
7. express-session에 설정한 대로 브라우저에 connect.sid 세션 쿠키 전송
8. 로그인 완료
 */

