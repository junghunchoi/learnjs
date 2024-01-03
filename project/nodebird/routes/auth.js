const express =require('express');
const passport = require('passport');

const {isLoggedIn, isNotLoggedIn} = require('./middlewares');
const {join, login, logout} = require('../controller/auth');

const router = express.Router();

router.post('/join', isNotLoggedIn, join);