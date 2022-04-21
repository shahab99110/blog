const express = require('express');
const { httpGetAllPost} = require('./post.controller');

const postRouter = express.Router();

postRouter.get('/posts', httpGetAllPost)

module.exports = postRouter;