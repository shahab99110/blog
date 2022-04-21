const express = require("express");
const mongodb = require("mongodb");

const db = require("../data/database");

const bcrypt = require("bcryptjs");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const querystring = require("querystring");

const ObjectId = mongodb.ObjectId;

const router = express.Router();

// R O U T E S


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
      name: "",
      userName: "",
      email: "",
    };
  }
  req.session.inputData = null;
  res.render("sign-up", { inputData: sessioninputData });
});

router.post("/signup", async function (req, res) {
  const userData = req.body;
  const enteredName = userData.name;
  const enteredUserName = userData.userName;
  const enteredEmail = userData.email;
  const enteredPassword = userData.password;
  const enteredConfirmPassword = userData.confirmPassword;

  // if (
  //   !enteredEmail ||
  //   !enteredConfirmPassword ||
  //   !enteredPassword ||
  //   enteredPassword.trim().length < 6 ||
  //   enteredPassword !== enteredConfirmPassword ||
  //   !enteredEmail.includes("@")
  // ) {
  //   req.session.inputData = {
  //     hasError: true,
  //     message: "invalid input- please try again",
  //     name:enteredName,
  //     userName: enteredUserName,
  //     email: enteredEmail,

  //   };
  //   req.session.save(function () {
  //     console.log("Incorrect data");
  //     res.redirect("/sign-up");
  //   });
  //   return;
  // }
  const existingUser = await db
    .getDb()
    .collection("users")
    .findOne({ email: enteredEmail });

  if (existingUser) {
    req.session.inputData = {
      hasError: true,
      message: "Email already in use",
      name: enteredName,
      userName: enteredUserName,
      email: enteredEmail,
    };
    req.session.save(function () {
      console.log("Email already in use");
      return res.redirect("sign-up");
    });

    const existingUserUserName = await db
      .getDb()
      .collection("users")
      .findOne({ userName: enteredUserName });

    if (existingUserUserName) {
      req.session.inputData = {
        hasError: true,
        message: "User Name already in use",
        name: enteredName,
        userName: enteredUserName,
        email: enteredEmail,
      };
      req.session.save(function () {
        console.log("User Name already in use");
        return res.redirect("sign-up");
      });
    }
    return;
  }

  const hashPassword = await bcrypt.hash(enteredPassword, 12);

  const user = {
    name: enteredName,
    userName: enteredUserName,
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
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    };
  }
  req.session.inputData = null;
  res.render("sign-in", { inputData: sessioninputData });
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
    };
    req.session.save(function () {
      console.log("invalid email or password");
      res.redirect("/sign-in");
    });
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
    };
    req.session.save(function () {
      console.log("invalid email or password");
      res.redirect("/sign-in");
    });
    return;
  }
  req.session.user = { id: existingUser._id, email: existingUser.email, name: existingUser.userName };
  req.session.isAuthenticated = true;
  req.session.save(function () {
    console.log(existingUser);
    res.redirect("/admin");
  });
});

router.get("/admin", async function (req, res) {
  if (!req.session.isAuthenticated) {
    return res.render("401");
  }
  const userId = new ObjectId(req.session.user.id);
  const result = await db.getDb().collection("posts").find({authorID:userId}).toArray();
  console.log("you are on admin page");
  res.render("admin", {result:result});
});

router.get("/log-out", function (req, res) {
  res.redirect("/logout");
});

router.post("/logout", function (req, res) {
  req.session.user = null;
  req.session.isAuthenticated = false;
  res.redirect("/");
});


//google signin

const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID ||
  "...."; // replace “....” with your client id
const GOOGLE_CLIENT_SECRET =
  process.env.GOOGLE_CLIENT_SECRET || "...."; // replace “....” with your secret id
 
const redirectURI = "auth/google";
const SERVER_ROOT_URI = "http://localhost:3000"; // server port
const JWT_SECRET = "shhhhh";// jwt secret key, name whatever u want
const COOKIE_NAME = "auth_token";// cookie name, used in JWT later

function getTokens({ code, clientId, clientSecret, redirectUri }) {
  /*
   * Uses the code to get tokens
   * that can be used to fetch the user's profile
   */
  const url = "https://oauth2.googleapis.com/token";
  const values = {
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  };
  return axios //we(server) send get request to google for token
    .post(url, querystring.stringify(values), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })  
    .then((res) => res.data)
    .catch((error) => {
      console.error(`Failed to fetch auth tokens`);
      throw new Error(error.message);
    });
}
 
// This is 2nd step: after consent screen, google will automaticaly send get request to “/oauth/google” which is stored in redirecURI(after client secret id)
router.get(`/${redirectURI}`, async (req, res) => {
    console.log("after google signin")
  const code = req.query.code;
 
  const { id_token, access_token } = await getTokens({ // calling function above
    code,
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    redirectUri: `${SERVER_ROOT_URI}/${redirectURI}`,
  });
 
  // Fetch the user's profile with the access token and bearer
  const googleUser = await axios
    .get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      {
        headers: {
          Authorization: `Bearer ${id_token}`,
        },
      }
    )
    .then((res) => res.data)
    .catch((error) => {
      console.error(`Failed to fetch user`);
      throw new Error(error.message);
    });
 
// encryption of token through JWT
  const token = jwt.sign(googleUser, JWT_SECRET);
// sending token to user in form of cookie
  res.cookie(COOKIE_NAME, token, {
    maxAge: 900000,
    httpOnly: true,
    secure: false,
  });
console.log(token);
  res.redirect('admin');
});
 
router.get("/auth/admin", async (req, res) => {
    console.log("this is admin dashboard");
    
    const decoded = jwt.verify(req.cookies[COOKIE_NAME], JWT_SECRET);
    const enteredEmail = decoded.email;
    const enteredName = decoded.name;
    const enteredUserName = decoded.name;
    const existingUser = await db
    .getDb()
    .collection("users")
    .findOne({ email: enteredEmail });
    console.log("till exisiting user")
    if(!existingUser){
      const user = {
        name: enteredName,
        userName: enteredUserName,
        email: enteredEmail,
      };
      await db.getDb().collection("users").insertOne(user);
      req.session.user = { id: existingUser._id, email: existingUser.email, name: existingUser.userName };
  req.session.isAuthenticated = true;
  req.session.save(function () {
    console.log(existingUser);

    return res.redirect("/admin");
  })
    };
  req.session.user = { id: existingUser._id, email: existingUser.email, name: existingUser.userName };
  req.session.isAuthenticated = true;
  req.session.save(function () {
    console.log(existingUser);

    res.redirect("/admin");  
  })
 
  });
