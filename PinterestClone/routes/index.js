var express = require('express');
var router = express.Router();
const userModel = require('./users');
const postModel = require('./post');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const upload = require("./multer")

passport.use(new LocalStrategy(userModel.authenticate()));
 passport.serializeUser(userModel.serializeUser());
 passport.deserializeUser(userModel.deserializeUser());

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', function(req, res, next) {
  res.render('login',{error:req.flash("error")});
});

router.post('/upload',isLoggedIn,upload.single("file"), async(req, res)=> {
  if(!req.file){
    return res.status(404).send("No files were uploaded.");
  }
  const user = await userModel.findOne({username:req.session.passport.user})
  const post =  await postModel.create({
    image:req.file.filename,
    imageText:req.body.filecaption,
    user:user._id
  })
  user.posts.push(post._id)
  await user.save()
  res.redirect("/profile")
});



router.get('/profile', isLoggedIn, async function(req, res, next) {
  const user = await userModel.findOne({
    username: req.session.passport.user
  
  }).populate("posts")
  console.log(user)
  res.render('profile',{user});
});

router.get('/feed',  function(req, res, next) {
  res.render('feed');
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
  failureRedirect: '/login',
  failureFlash:true
}),function(req,res){});

router.get('/logout', function(req, res, next) {
  req.logout(function(err){
    if(err){return next(err);}
    res.redirect('/');
    console.log("logged out")
  });
  
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

module.exports = router;
