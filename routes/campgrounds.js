var express		= require("express");
var router		= express.Router();
var Campground	= require("../models/campground");
var middleware  = require("../middleware");


//INDEX - list all campgrounds
router.get("/",function(req,res){
	Campground.find({},function(err,allcampgrounds){
		if(err){
			console.log(err);
		}else{
			res.render("campgrounds/index",{campgrounds: allcampgrounds, page: "campgrounds"});
		}
	});
});

//NEW - display form to add a new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("campgrounds/new");
});

//CREATE - create a new campground
router.post("/", middleware.isLoggedIn, function(req,res){
	var name = req.body.name;
	var price = req.body.price;
	var image = req.body.image;
	var description = req.body.description;
	var author = {
		id: req.user._id,
		username: req.user.username
	};
	var newCampground = {name: name, price: price,  image: image, description: description, author: author};
	Campground.create(newCampground,function(err,campground){
		if(err){
			console.log("Error en la carga!");
			console.log(err);
		}else{
			res.redirect("/campgrounds");
		}
	});
});

//SHOW campgrounds
router.get("/:id",function(req, res){
    Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground){
    	if(err || !foundCampground){
    		req.flash("error", "Post no encontrado");
    		res.redirect("/campgrounds");
    	}else{
    		res.render("campgrounds/show",{campground:foundCampground});
    	}	
    });
});

//EDIT campground
router.get("/:id/edit", middleware.checkCampgroundOwnership , function(req, res) {
		Campground.findById(req.params.id, function(err, foundCampground){
			if(err){
				console.log(err);
			}
			res.render("campgrounds/edit",{campground: foundCampground});
	});
});

//UPDATE campground
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
	req.body.campground.description = req.sanitize(req.body.campground.description);
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
		if(err){
			res.redirect("/campgrounds");
		}else{
			res.redirect("/campgrounds/"+req.params.id);
		}
	});
});

//REMOVE campground
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/campgrounds");
		}else{
			res.redirect("/campgrounds");
		}
	});
});

module.exports = router;