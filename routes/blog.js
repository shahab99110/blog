const express = require("express");
const mongodb = require("mongodb");

const db = require("../data/database");

const bcrypt = require("bcryptjs");
const session = require("express-session");

const ObjectId = mongodb.ObjectId;

const router = express.Router();

// R O U T E S

router.get("/", function (req, res) {
  res.redirect("/posts");
});

router.get("/posts", async function (req, res) {
  const posts = await db
    .getDb()
    .collection("posts")
    .find({})
    .project({ title: 1, summary: 1, "author.name": 1 })
    .toArray();
  res.render("posts-list", { posts: posts });
});

router.get("/new-post", async function (req, res) {
  const authors = await db.getDb().collection("authors").find().toArray();
  res.render("create-post", { authors: authors });
});

router.post("/posts", async function (req, res) {
  const authorId = new ObjectId(req.body.author);
  const author = await db
    .getDb()
    .collection("authors")
    .findOne({ _id: authorId });

  const newPost = {
    title: req.body.title,
    summary: req.body.summary,
    body: req.body.content,
    date: new Date(),
    author: {
      id: authorId,
      name: author.name,
      email: author.email,
    },
  };

  const result = await db.getDb().collection("posts").insertOne(newPost);
  console.log(result);
  res.redirect("/posts");
});

router.get("/posts/:id", async function (req, res, next) {
  let postId = req.params.id;

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

  res.render("post-detail", { post: post });
});

router.get("/posts/:id/edit", async function (req, res) {
  const postId = req.params.id;
  const post = await db
    .getDb()
    .collection("posts")
    .findOne({ _id: new ObjectId(postId) }, { title: 1, summary: 1, body: 1 });

  if (!post) {
    return res.status(404).render("404");
  }

  res.render("update-post", { post: post });
});

router.post("/posts/:id/edit", async function (req, res) {
  const postId = new ObjectId(req.params.id);
  const result = await db
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

  res.redirect("/posts");
});

router.post("/posts/:id/delete", async function (req, res) {
  const postId = new ObjectId(req.params.id);
  const result = await db
    .getDb()
    .collection("posts")
    .deleteOne({ _id: postId });
  res.redirect("/posts");
});

module.exports = router;

//u s e r   a u t h e n t i c a t i o n

router.get("/sign-up", function (req, res) {
  let sessioninputData = req.session.inputData;
  if (!sessioninputData) {
    sessioninputData = {
      hasError: false,
      email: "",
      confirmEmail: "",
      password: "",
    };
  }
  req.session.inputData = null;
  res.render("sign-up", { inputData: sessioninputData });
});

router.post("/signup", async function (req, res) {
  const userData = req.body;
  const enteredEmail = userData.email;
  const enteredConfirmEmail = userData.confirmEmail;
  const enteredPassword = userData.password;

  if (
    !enteredEmail ||
    !enteredConfirmEmail ||
    !enteredPassword ||
    enteredPassword.trim().length < 6 ||
    enteredEmail !== enteredConfirmEmail ||
    !enteredEmail.includes("@")
  ) {
    req.session.inputData = {
      hasError: true,
      message: "invalid input- please try again",
      email: enteredEmail,
      confirmEmail: enteredConfirmEmail,
      password: enteredPassword,
    };
    req.session.save(function () {
      console.log("Incorrect data");
      res.redirect("/sign-up");
    });
    return;
  }
  const existingUser = await db
    .getDb()
    .collection("users")
    .findOne({ email: enteredEmail });

  if (existingUser) {
    req.session.inputData = {
      hasError: true,
      message: "Email already in use",
      email: enteredEmail,
      confirmEmail: enteredConfirmEmail,
      password: enteredPassword,
    };
    req.session.save(function () {
      console.log("Email already in use");
      return res.redirect("sign-up");
    });

    return;
  }

  const hashPassword = await bcrypt.hash(enteredPassword, 12);

  const user = {
    email: enteredEmail,
    password: hashPassword,
  };

  await db.getDb().collection("users").insertOne(user);
  console.log(user);
  res.redirect("sign-in");
});

router.get("/sign-in", function (req, res) {
  let sessioninputData = req.session.inputData;
  if (!sessioninputData) {
    sessioninputData = {
      hasError: false,
      email: "",
      confirmEmail: "",
      password: "",
    };
  }
  req.session.inputData = null;
  res.render("sign-in", {inputData: sessioninputData});
});

router.post("/signin", async function (req, res) {
  const userData = req.body;
  const enteredEmail = userData.email;
  const enteredPassword = userData.password;

  const existingUser = await db
    .getDb()
    .collection("users")
    .findOne({ email: enteredEmail });

  if (!existingUser) {

    req.session.inputData = {
      hasError: true,
      message: "Invalid email or password - Please try again",
      email: enteredEmail,
      password: enteredPassword,
    }
    req.session.save(function(){
      console.log("invalid email or password");
      res.redirect("/sign-in");
    })
    return;
  }

  const existingPassword = await bcrypt.compare(
    enteredPassword,
    existingUser.password
  );

  if (!existingPassword) {
    req.session.inputData = {
      hasError: true,
      message: "Invalid email or password - Please try again",
      email: enteredEmail,
      password: enteredPassword,
    }
    req.session.save(function(){
      console.log("invalid email or password");
      res.redirect("/sign-in");
    })
    return;
  }
  req.session.user = { id: existingUser._id, email: existingUser.email };
  req.session.isAuthenticated = true;
  req.session.save(function () {
    console.log("user authenticated");
    res.redirect("/admin");
  });
});

router.get("/admin", function (req, res) {
  if (!req.session.isAuthenticated) {
    return res.render("401");
  }
  console.log("you are on admin page");
  res.render("admin");
});

router.get("/log-out", function (req, res) {
  res.redirect("/logout");
});

router.post("/logout", function (req, res) {
  req.session.user = null;
  req.session.isAuthenticated = false;
  res.redirect("/");
});
