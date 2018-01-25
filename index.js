// get packages
var express     = require('express');
var app         = express();
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var expressSession = require('express-session');
var config = require('./config'); // get our config file
var User   = require('./app/models/user'); // get our mongoose model
var Post   = require('./app/models/post'); // get our mongoose model

// configuration
var port = process.env.PORT || 8080; // used to create, sign, and verify tokens
mongoose.connect(config.database); // connect to database
app.set('superSecret', config.secret); // secret variable

// configure passport strategy
passport.use(new Strategy(
    function(username, password, cb) {
        User.findOne({
            username: username
          }, function(err, user) {
        if (err) { return cb(err); }
        if (!user) { return cb(null, false); }
        if (user.password != password) { return cb(null, false); }
        return cb(null, user);
      });
    }));
  
  
  // Configure Passport authenticated session persistence
  passport.serializeUser(function(user, cb) {
    cb(null, user._id);
  });
  
  passport.deserializeUser(function(id, cb) {
    User.findOne({
        _id: id
      }, function (err, user) {
      if (err) { return cb(err); }
      cb(null, user);
    });
  });
  
// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// keep persistent session
app.use(require('express-session')({ secret: 'psipapp', resave: false, saveUninitialized: false }));
// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// use morgan to log requests to the console
app.use(morgan('dev'));

//initialize passport
app.use(passport.initialize());
app.use(passport.session());

// root route
app.get('/', function(req, res) {
    res.send('Hello, the endpoints are at http://localhost:' + port + '/summary, /login, and /posts');
});

// post route
app.get('/posts',
  require('connect-ensure-login').ensureLoggedIn(), function(req, res){
      console.log(req.user);
        Post.findOne({ username: req.user.username }, function(err, user) {
                res.json(user);
          });
  });
  
// basic route
app.get('/summary', function(req, res) {
    User.find().count(function(err, count) {
        Post.find().count(function(err, count2) {
        res.send("Number of users:"+ count+"\n"+"\nNumber of posts:"+ count2);
    });
      });
      
});
app.get('/login',
  function(req, res){
    res.render('login');
  });



  app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/summary' }),
  function(req, res) {
    res.redirect('/posts');
  });

// =======================
// start the server ======
// =======================
app.listen(port);
console.log('Server at http://localhost:' + port);