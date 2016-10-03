var express = require('express');
var router = express.Router();
var passport = require('passport');

var User = require('../models/user');
var Runs = require('../models/runs');
var Verify    = require('./verify');

/* GET users listing. */
router.route('/')
.get(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req,res,next){
    User.find({}, function (err, user) {
        if (err) throw err;
        res.json(user);
    });
});

router.post('/register', function(req, res) {
    User.register(new User({ username : req.body.username }),
        req.body.password, function(err, user) {
        if (err) {
            return res.status(500).json({err: err});
        }
        if(req.body.firstname) {
            user.firstname = req.body.firstname;
        }
        if(req.body.lastname) {
            user.lastname = req.body.lastname;
        }
        user.save(function(err,user) {
            passport.authenticate('local')(req, res, function () {
                return res.status(200).json({status: 'Registration Successful!'});
            });
        });
    });
});

router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        err: info
      });
    }
    req.logIn(user, function(err) {
      if (err) {
        return res.status(500).json({
          err: 'Could not log in user'
        });
      }
        var token = Verify.getToken({"username":user.username, "_id":user._id, "admin":user.admin});
        res.status(200).json({
          status: 'Login successful!',
          success: true,
          admin: user.admin,
          token: token
        });
    });
  })(req,res,next);
});

router.get('/logout', function(req, res) {
    req.logout();
  res.status(200).json({
    status: 'Bye!'
  });
});

router.route('/runs')
.get(Verify.verifyOrdinaryUser, function (req, res, next) {
    console.log(req.body);
    Runs.find({ranBy : req.decoded._id}).sort({runDate: -1})
        .exec(function (err, runs) {
        if (err) next(err) ;
        res.json(runs);
    });
})
.post(Verify.verifyOrdinaryUser, function (req, res, next) {
    //console.log(req.body);
    var newRun = {};
    newRun.name = req.body.name;
    newRun.ranBy = req.decoded._id;
    newRun.duration = parseInt(req.body.durationS, 10) + 
            (parseInt(req.body.durationM, 10) * 60.0) +
            (parseInt(req.body.durationH , 10) * 60.0 * 60.0);
    newRun.distance = req.body.distance;
    newRun.calories = req.body.calories;
    newRun.heartrate = req.body.heartrate;
    newRun.effort = req.body.effort;
    Runs.create(newRun, function (err, run) {
        if (err) next(err) ;
        console.log('Run created!');
        var id = run._id;
        res.writeHead(200, {
            'Content-Type': 'text/plain'
        });
        res.end('Added the run with id: ' + id);
        console.log('Added the run with id: ' + id);
    });
})
.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
    Runs.remove({ranBy : req.decoded._id}, function (err, resp) {
        if (err) next(err) ;
        res.json(resp);
    });
});

module.exports = router;
