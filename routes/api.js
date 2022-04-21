const express = require('express');
const api = express.Router();

const postRouter = require('../routes/posts/post.router')
const authRouter = require('../routes/auth/sign-up.router')

api.use('/posts', postRouter )
api.use('/auth/form', authRouter);
module.exports = api;
