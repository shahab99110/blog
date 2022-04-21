const express = require('express');
const { httpGetAllPost, 
    httpGetNewPost, 
    httpAddNewPost, 
    httpGetDetailPost,
    httpGetEditPost,
    httpPostEditPost,
    httpPostDeletePost} = require('./post.controller');

const postRouter = express.Router();

postRouter.get('/posts', httpGetAllPost)
postRouter.get('/new-post', httpGetNewPost)
postRouter.post('/posts', httpAddNewPost)
postRouter.get('/posts/:id', httpGetDetailPost)
postRouter.get('/posts/:id/edit', httpGetEditPost)
postRouter.post('/posts/:id/edit', httpPostEditPost)
postRouter.post('/posts/:id/delete', httpPostDeletePost)

module.exports = postRouter;