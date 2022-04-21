const express = require('express');
const api = express.Router();

const postRouter = require('./post.router')

api.get('/posts', postRouter )
module.exports = api;
