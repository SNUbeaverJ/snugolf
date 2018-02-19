var express=require("express"),
    mongoose = require("mongoose"),
    app=express(),
    bodyParser=require("body-parser"),
    Act= require("./models/act"),
    passport = require("passport"),
    LocalStrategy=require("passport-local"),
    User=require("./models/user"),
    Comment= require("./models/comment"),
    methodOver = require("method-override"),
    flash= require("connect-flash"),
    seedDB=require("./seeds");
    
var commentRoutes=require("./routes/comments"),
    obCommentRoutes=require("./routes/comments_ob"),
    ybCommentRoutes=require("./routes/comments_yb"),
    activityRoutes=require("./routes/activity"),
    obboardRoutes=require("./routes/boardob"),
    boardRoutes=require("./routes/board"),
    noticeRoutes=require("./routes/notice"),
    indexRoutes=require("./routes/index");
    
// mongoose.connect("mongodb://localhost/snugolf");
mongoose.connect("mongodb://snugolf:snugolf0201@ds241668.mlab.com:41668/snugolf");
app.use(express.static(__dirname+"/public"));
app.use(methodOver("_method"));
app.use(flash());
//seedDB();

//passport config
app.use(require("express-session")({
    secret: "who am i",
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(function(req,res,next){
    res.locals.currentUser=req.user;
    res.locals.error=req.flash("error");
    res.locals.success=req.flash("success");
    next();
});


// app.use("/notice",noticeRoutes);
app.use("/boardob/:ob_id/comments",obCommentRoutes);
app.use("/board/:b_id/comments",ybCommentRoutes);
app.use("/activity/:id/comments",commentRoutes);
app.use("/boardob", obboardRoutes);
app.use("/activity", activityRoutes);
app.use("/board", boardRoutes);
app.use(indexRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server Started");
})