const express = require('express');
const { httpGetAllPost, httpGetNewPost, httpAddNewPost, httpGetDetailPost} = require('./post.controller');

const postRouter = express.Router();

postRouter.get('/posts', httpGetAllPost)
postRouter.get('/new-post', httpGetNewPost)
postRouter.post('/posts', httpAddNewPost)
postRouter.get('/posts/:id', httpGetDetailPost)

module.exports = postRouter;