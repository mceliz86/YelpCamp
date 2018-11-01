var Campground = require("../models/campground");
var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req, res, next){
	if(req.isAuthenticated()){
		Campground.findById(req.params.id, function(err, foundCampground){
			if(err || !foundCampground){
				req.flash("error", "Post no encontrado");
				res.redirect("back");
			}else{
				if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin){
					next();
				}else{
					req.flash("error", "No eres propietario de este post");
					res.redirect("back");
				}
		}
	});	
	}else{
		req.flash("error", "Debes iniciar sesión primero");
		res.redirect("back");
	}	
};

middlewareObj.isLoggedIn = function(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error", "Por favor inicie sesión primero");
	res.redirect("/login");
};


module.exports = middlewareObj;