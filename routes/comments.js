var express 	= require("express");
var router		= express.Router({mergeParams: true});
var Campground	= require("../models/campground");
var Comment 	= require("../models/comment");
var middleware	= require("../middleware");

//New comment form
router.get("/new", middleware.isLoggedIn, function(req,res){
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			console.log(err);
		}else{
			res.render("comments/new",{campground: campground});
		}
	});
});

//Comments create
router.post("/", middleware.isLoggedIn, function(req,res){
	Campground.findById(req.params.id, function(err, campground) {
	    if(err){
	    	console.log(err);
	    	res.redirect("/campgrounds");
	    }else{
	    	Comment.create(req.body.comment, function(err, comment){
	    		if(err){
	    			console.log(err);
	    		}else{
	    			comment.author.id=req.user._id;
	    			comment.author.username=req.user.username;
	    			comment.save();
	    			campground.comments.push(comment);
	    			campground.save();
	    			res.redirect("/campgrounds/"+campground._id);
	    		}	
	    	});
	    }
	});
});

//EDIT comment (show form)
router.get("/:comment_id/edit", middleware.checkCampgroundOwnership, function(req, res){
	Comment.findById(req.params.comment_id, function(err, commentFound) {
	    if(err || !commentFound){
	    	req.flash("error", "Comentario no encontrado");
	    	res.redirect("back");
	    }else{
	    	res.render("comments/edit",{campground_id: req.params.id, comment: commentFound});
	    }
	});
});

//UPDATE comment
router.put("/:comment_id", middleware.checkCampgroundOwnership, function(req, res){
	//req.body.comment.text = req.sanitize(req.body.comment.text);
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, commentUpdated){
	if(err){
		console.log(err);
	}else{
		res.redirect("/campgrounds/"+req.params.id);
	}
	});
});

//DELETE comment
router.delete("/:comment_id", middleware.checkCampgroundOwnership, function(req, res){
	Comment.findByIdAndRemove(req.params.comment_id, function(err){
		if(err){
			console.log(err);
		}else{
			req.flash("success", "comentario eliminado con exito");
			res.redirect("/campgrounds/"+req.params.id);
		}
	});
});

module.exports = router;