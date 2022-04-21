const {getAllPost} = require('../model/post.model');

async function httpGetAllPost(req, res) {
  const posts = await getAllPost();
  res.render("posts-list", { posts: posts });
}

module.exports = {
  httpGetAllPost,
};
