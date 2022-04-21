const { getAllPost, addNewPost, getDetailPost, editPost } = require("../model/post.model");

async function httpGetAllPost(req, res) {
  const posts = await getAllPost();
  res.render("posts-list", { posts: posts });
}

function httpGetNewPost(req, res) {
  // const authors = req.session.user.email;
  // const aUth = await db.getDb().collection('users').findOne({email:authors});
  // console.log(aUth);
  // const authorsd = await db.getDb().collection("users").find().toArray();
  res.render("create-post");
}

async function httpAddNewPost(req, res) {
  await addNewPost();
  res.redirect("/");
}

async function httpGetDetailPost(req,res){
    let postId = req.params.id;
    const post = await getDetailPost(postId);
    res.render("post-detail", { post: post });
}

async function httpGetEditPost(req,res){
const postId = req.params.id;
const post = await editPost(postId);
res.render("update-post", { post: post });
}

async function httpPostEditPost(req,res){
  const postId = new ObjectId(req.params.id);
  await postEditPost(postId);
  res.redirect("/posts");
}

module.exports = {
  httpGetAllPost,
  httpGetNewPost,
  httpAddNewPost,
  httpGetDetailPost,
  httpGetEditPost,
  httpPostEditPost,
};
