var express =		require("express");
var router =		express.Router();
var User =			require("../models/user");
var Campground =	require("../models/campground");
var passport =		require("passport");
var async	= require("async");
var nodemailer	= require("nodemailer");
var crypto	= require("crypto");

//root route
router.get("/",function(req,res){
	res.render("landing");	
});

//---------------
//REGISTER ROUTES
//---------------

//show register form
router.get("/register", function(req, res) {
    res.render("register",{page: "register"});
});

//handle signup logic
router.post("/register", function(req, res) {
	var newUser = new User({
		username:	req.body.username,
		avatar:		req.body.avatar,
		firstName:	req.body.firstName,
		lastName:	req.body.lastName,
		email:		req.body.email
	});
	if(req.body.adminCode === "admin"){
		newUser.isAdmin = true;
	}
	User.register(newUser, req.body.password, function(err){
		if(err){
    		console.log(err);
    		return res.render("register", {error: err.message});
		}
		passport.authenticate("local")(req, res, function(){
			req.flash("success", "Registro exitoso");
			res.redirect("/campgrounds");		
		});
	});
});

//------------
//LOGIN ROUTES
//------------

//show login form
router.get("/login", function(req, res) {
   res.render("login", {page: "login"}); 
});

//handling login logic
router.post("/login", passport.authenticate("local",
	{
		successRedirect: "/campgrounds",
		failureRedirect: "/login"
	}) , function(req, res) {
});

//LOGOUT logic
router.get("/logout", function(req, res) {
   req.logout();
   req.flash("error", "Se cerró sesión correctamente");
   res.redirect("/campgrounds");
});

//------------------
//USER PROFILE ROUTE
//------------------
router.get("/users/:id", function(req, res) {
	User.findById(req.params.id, function(err, foundUser){
		if(err){
			req.flash("error","Error en perfil de usuario");
			res.redirect("/");
		}else{
			Campground.find().where("author.id").equals(foundUser._id).exec( function(err, campgrounds){
				if(err){
					req.flash("error","Error en perfil de usuario");
					res.redirect("/");
				}
				res.render("users/show",{user: foundUser, campgrounds: campgrounds});
			});
		}	
	});
});


//--------------
//PASSWORD RESET
//--------------

router.get('/forgot', function(req, res) {
  res.render('forgot');
});

router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No hay ningún usuario registrado con ese email');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hora

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'holamicerino@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'YelpCamp',
        subject: 'Reseteo de Password YelpCamp',
        text: 'Ha olvidado su password.\n\n' +
          'Por favor haga click en el siguiente enlace o copie la url en su navegador:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'Si no solicito el reseteo de password ignore este mail.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('mail de password reset enviado');
        req.flash('success', 'Un email ha sido enviado a ' + user.email + ' con las instrucciones para el reseteo.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});

router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'El token para reseteo de password es invalido o ha expirado');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token});
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'El token para reseteo de password es invalido o ha expirado');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
            req.flash("error", "La confirmacion de password no coincide");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'holamicerino@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'YelpCamp',
        subject: 'Reseteo de Password',
        text: 'Hola,\n\n' +
          'El password del usuario ' + user.email + ' se ha cambiado con exito.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Su password se ha cambiado con exito');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/campgrounds');
  });
});

module.exports = router;