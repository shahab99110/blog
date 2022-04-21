const db = require('../service/mongo');

async function getAllPost(){
    const posts = await db
    .getDb()
    .collection("posts")
    .find({})
    .project({ title: 1, summary: 1, authorName: 1 })
    .toArray();
    return posts;
}

async function addNewPost(){
    const usersId = new ObjectId(req.session.user.id);
    const author = await db.getDb().collection("users").findOne({ _id: usersId });
  
    const newPost = {
      title: req.body.title,
      summary: req.body.summary,
      body: req.body.content,
      date: new Date(),
      authorID:usersId,
      authorName: author.name,
      authorEmail:author.email,
    };
     await db.getDb().collection("posts").insertOne(newPost);
}

function getDetailPost(postId){

}

module.exports = {
    getAllPost,
    addNewPost,
}