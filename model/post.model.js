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

module.exports = {
    getAllPost,
}