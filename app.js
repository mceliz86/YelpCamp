var express				= require("express"),
	app					= express(),
	bodyParser			= require("body-parser"),
	mongoose			= require("mongoose"),
	methodOverride		= require("method-override"),
	expressSanitizer	= require("express-sanitizer"),
	flash				= require("connect-flash"),

	User	= require("./models/user"),
	
	passport			= require("passport"),
	LocalStrategy		= require("passport-local"),
	campgroundRoutes	= require("./routes/campgrounds"),
	commentsRoutes		= require("./routes/comments"),
	indexRoutes			= require("./routes/index");
	//seedDB = require("./seeds"),

mongoose.connect("mongodb://localhost:27017/yelp_camp", { useNewUrlParser: true });
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(expressSanitizer());
app.use(flash());

app.locals.moment = require('moment');

//seedDB();

//PASSPORT CONFIGURATION
app.use(require("express-session")({
	secret: "asf41a5411fasd2f654as",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error	= req.flash("error");
	res.locals.success	= req.flash("success");
	next();
});

app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentsRoutes);

app.listen(process.env.PORT, process.env.IP, function(err){
	if(err){
		console.log(err);
	}
    console.log("Servidor OK");
});