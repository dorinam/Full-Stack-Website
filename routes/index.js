var express = require('express');
var router = express.Router();
var User = require('../models/user');
var mid = require('../middleware');

//GET /Profile
router.get('/profile', mid.requiresLogin, function(req, res, next) {
  User.findById(req.session.userId)
  .exec(function (error, user) {
    if (error) {
      return next(error);
    } else {
      return res.render('profile', { title: 'Profile', name: user.name, favorite:
    user.favoriteBook });
    }
  });
});

//To give access to a page trough middleware you do it with: mid.requiresLogin.
//EXAMPLE:
    // router.get('/about', mid.requiresLogin, function(req, res, next) {
    // return res.render('about', { title: 'About' });
    // });

//GET /Logout
router.get('/logout', function(req, res, next) {
  if (req.session) {
    // delete the session object
    req.session.destroy(function(err) {
      if(err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

//GET /Login
router.get('/login', mid.loggedOut, function(req, res, next) {
  return res.render('login', { title: 'Log in' });
});

//POST /Login
router.post('/login', function(req, res, next) {
if (req.body.email && req.body.password) {
  User.authenticate(req.body.email, req.body.password, function (error, user){
    if (error || !user) {
      var err = new Error('Wrong email or password.');
      err.status = 401;
      return next(err);
    } else {
      req.session.userId = user._id;
      return res.redirect('/profile');
    }
  });

} else {
  var err = new Error('Email and password are required.');
  err.status = 401;
  return next(err);
  } 
});

// GET /Register
router.get('/register', mid.loggedOut, function(req, res, next) {
  return res.render('register', { title: 'Sign Up' });
});

// GET /Register
router.post('/register', function(req, res, next) {
  if(req.body.email &&
    req.body.name &&
    req.body.favoriteBook &&
    req.body.password &&
    req.body.confirmPassword) {

      //confirm that the user typed same password twice
      if(req.body.password !== req.body.confirmPassword) {
        var err = new Error('Password do not match.');
        err.status = 400;
        return next(err);
      }

      //create object with form input
      var userData = {
        email: req.body.email,
        name: req.body.name,
        favoriteBook: req.body.favoriteBook,
        password: req.body.password
      };

      //use schema's create method to insert document into Mongo
      User.create(userData, function (error, user){
        if(error) {
          return next(error);
        } else {
          req.session.userId = user._id;
          return res.redirect('/profile');
        }
      });

    } else {
      var err = new Error('All fields required.');
      err.status = 400;
      return next(err);
    }
});

// GET 
router.get('/', function(req, res, next) {
  return res.render('index', { title: 'Home' });
});

// GET /About
router.get('/about', function(req, res, next) {
  return res.render('about', { title: 'About' });
});

// GET /Contact
router.get('/contact', function(req, res, next) {
  return res.render('contact', { title: 'Contact' });
});

module.exports = router;
