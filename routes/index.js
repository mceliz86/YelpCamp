var express =		require("express");
var router =		express.Router();
var User =			require("../models/user");
var Campground =	require("../models/campground");
var passport =		require("passport");

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

module.exports = router;