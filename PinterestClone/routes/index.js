var express = require('express');
var router = express.Router();
const userModel = require('./users');
const postModel = require('./post');
const passport = require('passport');
const LocalStrategy = require('passport-local');

passport.use(new LocalStrategy(userModel.authenticate()));
// passport.serializeUser(userModel.serializeUser());
// passport.deserializeUser(userModel.deserializeUser());

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/profile', function(req, res, next) {
  res.send("profile page");
});

router.get('/profile', isLoggedIn, function(req, res, next) {
  res.render('profile');
});

router.post('/register', function(req, res) {
  const userData = new userModel({
    username: req.body.username,
    email: req.body.email,
    fullname: req.body.fullname,
  });

  userModel.register(userData, req.body.password).then(function(){
    passport.authenticate("local")(req,res,function(){
      res.redirect("/profile")
    })
  })
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/profile',
  failureRedirect: '/',
}));

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/');
}

module.exports = router;
