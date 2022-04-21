const path = require('path');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const session = require('express-session');
const mongodbStore = require('connect-mongodb-session');
const MongoDBStore = mongodbStore(session);
const db = require('../service/mongo');
const api = require('../routes/api');

const app = express();

app.use(
    cors({
      // Sets Access-Control-Allow-Origin to the UI URI
      origin: process.env.UI_ROOT_URI,
      // Sets Access-Control-Allow-Credentials to true
      credentials: true,
    })
  );
app.use(morgan('combined'));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true })); // Parse incoming request bodies
app.use(express.static('public'));// Serve static files (e.g. CSS files)
app.use(api)
const sessionStore = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  databaseName: "blog",
  collection: "session"
});
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
app.use(function (error, req, res, next) {
  // Default error handling function
  // Will become active whenever any route / middleware crashes
  console.log(error);
  res.status(500).render('500');
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.get('/', (req,res)=>{
  res.status(302).redirect("/posts");
})

module.exports = app;

