var express		= require("express");
var router		= express.Router();
var Campground	= require("../models/campground");
var middleware  = require("../middleware");
var multer		= require("multer");
var cloudinary = require('cloudinary');

var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

cloudinary.config({ 
  cloud_name: 'mojeda86', 
  api_key: 115421624635487, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

//INDEX - list all campgrounds
router.get("/",function(req,res){
	
	if(req.query.busqueda){
		const regex = new RegExp(escapeRegex(req.query.busqueda), 'gi');
		Campground.find({name: regex},function(err,allcampgrounds){
			if(err){
				console.log(err);
			}else{
				if(allcampgrounds.length<1){
					req.flash("error", "No hay resultados");
    				res.redirect("/campgrounds");
					
				}
				res.render("campgrounds/index",{campgrounds: allcampgrounds, page: "campgrounds"});
			}
		});
	}else{
		Campground.find({},function(err,allcampgrounds){
			if(err){
				console.log(err);
			}else{
				res.render("campgrounds/index",{campgrounds: allcampgrounds, page: "campgrounds"});
			}
		});
	}
});

//NEW - display form to add a new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("campgrounds/new");
});

//CREATE - create a new campground
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {
	cloudinary.uploader.upload(req.file.path, function(result) {
  // add cloudinary url for the image to the campground object under image property
	req.body.campground.image = result.secure_url;
  // add author to campground
	req.body.campground.author = {
		id: req.user._id,
    	username: req.user.username
	};
	Campground.create(req.body.campground, function(err, campground) {
    	if (err) {
    	req.flash('error', err.message);
    	return res.redirect('back');
    	}
    res.redirect('/campgrounds/' + campground.id);
	});
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

function escapeRegex(text){
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;