const express =require('express');
const passport = require('passport');

const {isLoggedIn, isNotLoggedIn} = require('../middlewares');
const {join, login, logout} = require('../controller/auth');

const router = express.Router();

// post auth/join
router.post('/join', isNotLoggedIn, join);

//post /auth/login
router.post('/login', isLoggedIn,login);

//get auth/logout
router.get('/logout', isLoggedIn,logout)

module.exports = router;