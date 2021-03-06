const path = require('path');

const express = require('express');

const cookieParser = require("cookie-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const querystring = require("querystring");


const session = require('express-session');
const mongodbStore = require('connect-mongodb-session');

const MongoDBStore = mongodbStore(session);

const blogRoutes = require('./routes/blog');
const db = require('./data/database');

const app = express();

const sessionStore = new MongoDBStore({
  uri: "mongodb://localhost:27017",
  databaseName: "blog",
  collection: "session"
});

// Activate EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true })); // Parse incoming request bodies
app.use(express.static('public')); // Serve static files (e.g. CSS files)

app.use(session({
  secret: "This-is-my-secret-key",
  resave: false,
  saveUninitialized: false,
  store: sessionStore
}));

app.use(async function(req, res, next){
  const user = req.session.user;
  const isAuth = req.session.isAuthenticated;
  if(!user || !isAuth){
    return next();
  }
  const userDoc = await db.getDb().collection('users').findOne({_id: user.id});
  res.locals.users = user;
  res.locals.isAuth = isAuth;
  next();
});


const UI_ROOT_URI = "http://localhost:3000/"; // client port
app.use(
  cors({
    // Sets Access-Control-Allow-Origin to the UI URI
    origin: UI_ROOT_URI,
    // Sets Access-Control-Allow-Credentials to true
    credentials: true,
  })
);
 
//middleware for cookieparser
app.use(cookieParser());


app.use(blogRoutes);

app.use(function (error, req, res, next) {
  // Default error handling function
  // Will become active whenever any route / middleware crashes
  console.log(error);
  res.status(500).render('500');
});




db.connectToDatabase().then(function () {
  app.listen(3000);
});