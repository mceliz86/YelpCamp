var mongoose = require("mongoose");
var Campground = require("./models/campground");
var Comment = require("./models/comment");

var data=[
		{
			name: "Camp1",
			image: "https://lakerooseveltadventures.com/wp-content/uploads/sites/5/2016/03/campground.jpg",
			description: "Description for camp number 1"
		},
		{
			name: "Camp2",
			image: "https://threerivers-drupal.s3.us-east-2.amazonaws.com/public/2017-03/CL_camping_Billboard_01.jpg",
			description: "Description for camp number 2"
		},
		{
			name: "Camp3",
			image: "https://res.cloudinary.com/simpleview/image/fetch/c_fill,f_auto,h_452,q_75,w_982/http://res.cloudinary.com/simpleview/image/upload/v1469218578/clients/lanecounty/constitution_grove_campground_by_natalie_inouye_417476ef-05c3-464d-99bd-032bb0ee0bd5.png",
			description: "Description for camp number 3"
		}
	];

function seedDB(){
	//Remove all campgrounds
	Campground.deleteMany({}, function(err){
		if(err){
			console.log(err);
		}else{
			console.log("removed campground!");
			//add campgrounds
			data.forEach(function(seed){
				Campground.create(seed, function(err, campground){
					if(err){
						console.log(err);
					}else{
						console.log("added a campground");
						//Create a comment
						Comment.create(
							{
								text: "text of the comment",
								author: "Author of the text"
							}, function(err, comment){
									if(err){
										console.log(err);
									}else{
										campground.comments.push(comment);
										campground.save();
									}
								});
						//Create a comment
					}
				});
			});
			//add campgrounds
		}
	});	
}

module.exports = seedDB;