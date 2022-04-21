const db = require('../service/mongo');

async function getAllPost() {
    const posts = await db
        .getDb()
        .collection("posts")
        .find({})
        .project({ title: 1, summary: 1, authorName: 1 })
        .toArray();
    return posts;
}

async function addNewPost() {
    const usersId = new ObjectId(req.session.user.id);
    const author = await db.getDb().collection("users").findOne({ _id: usersId });

    const newPost = {
        title: req.body.title,
        summary: req.body.summary,
        body: req.body.content,
        date: new Date(),
        authorID: usersId,
        authorName: author.name,
        authorEmail: author.email,
    };
    await db.getDb().collection("posts").insertOne(newPost);
}

async function getDetailPost(postId) {
    try {
        postId = new ObjectId(postId);
    } catch (error) {
        return res.status(404).render("404");
        // return next(error);
    }

    const post = await db
        .getDb()
        .collection("posts")
        .findOne({ _id: postId }, { summary: 0 });

    if (!post) {
        return res.status(404).render("404");
    }

    post.humanReadableDate = post.date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    post.date = post.date.toISOString();
    return post;
}

async function editPost(postId) {
    const post = await db
        .getDb()
        .collection("posts")
        .findOne({ _id: new ObjectId(postId) }, { title: 1, summary: 1, body: 1 });

    if (!post) {
        return res.status(404).render("404");
    }
    return post;
}

async function postEditPost(postId) {
    try {
        await db
            .getDb()
            .collection("posts")
            .updateOne(
                { _id: postId },
                {
                    $set: {
                        title: req.body.title,
                        summary: req.body.summary,
                        body: req.body.content,
                        // date: new Date()
                    },
                }
            );
        return;
    } catch (error) {
        return res.status(404).render("404");
    }

    module.exports = {
        getAllPost,
        addNewPost,
        getDetailPost,
        editPost,
        postEditPost,
    }