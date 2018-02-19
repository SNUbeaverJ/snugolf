var express= require("express");
var router= express.Router();
var Act= require("../models/act.js");
var middleware= require("../middleware");
var request=require("request");
var multer=require("multer");
var storage= multer.diskStorage({
    filename: function(req,file,callback){
        callback(null, Date.now()+file.originalname);
    }
});
var imageFilter= function(req, file, cb){
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)){
        return cb(new Error("이미지 파일만 업로드 가능합니다."),false);
    }
    cb(null,true);
}
var upload= multer({storage:storage, fileFilter:imageFilter});
var cloudinary= require("cloudinary");
cloudinary.config({
    cloud_name:"dib4nytku",
    api_key:"752179722391435",
    api_secret:"DFQTQBSSQuhkarcCOMPgxS2Jz-8"
});

router.get("/", function(req,res){
    var perPage=9;
    var pageQuery= parseInt(req.query.page);
    var pageNumber= pageQuery ? pageQuery : 1;
    var noMatch =null;
    
    
    
    if(req.query.search){
        const regex= new RegExp(escapeRegex(req.query.search),'gi');
        Act.find({name : regex}).skip((perPage*pageNumber)-perPage).limit(perPage).exec(function(e,act){
            Act.count({name:regex}).exec(function(e,count){
            
                if(e)console.log("ERROR");
                else {
                    if(act.length<1) req.flash('error',"검색 결과가 존재하지 않습니다.");
                    else res.render("activity/activity",{
                        act:act,
                        current: pageNumber,
                        pages: Math.ceil(count/perPage),
                        noMatch: noMatch,
                        search: req.query.search
                    });
                }
        })
    })
    }
    
    
    Act.find({}).sort('-created').skip((perPage*pageNumber)-perPage).limit(perPage).exec(function(e,act){
        Act.count().exec(function(e,count){
                    
                if(e)console.log("ERROR");
                else res.render("activity/activity",{
                    act:act,
                    current:pageNumber,
                    pages:  Math.ceil(count/perPage),
                    noMatch: noMatch,
                    search: false
                });
            })
        })
})  ;
router.get("/new",middleware.isLoggedIn ,function(req, res) {
    res.render("activity/new");
});
router.post("/",middleware.isLoggedIn, upload.single('image'), function(req,res){
    cloudinary.uploader.upload(req.file.path, function(result){
        var act_img=result.secure_url;
        var act_name=req.body.name;
        var act_dec=req.body.description;
        var author={
            id:req.user._id,
            username:req.user.username
         };
        var newAct={name:act_name, image:act_img, description:act_dec, author:author};
    //push to db
    Act.create(newAct, function(e, newAct){
        if(e){
            req.flash('error',e.message);
            return res.redirect('back');
        }else {
            req.flash("success", "게시글을 작성했습니다.");
            res.redirect("/activity");}
    });
    });
        
});
router.get("/:id", function(req, res) {
    //find act with such id and show info
    Act.findById(req.params.id).populate("comments").exec(function(e, found){
        if(e || !found) {
            req.flash("error","DB오류. 관리자에게 문의하십시오.");
            res.redirect("back");
        }
        else  {
            //console.log(found);
            res.render("activity/show", {act:found}
            );
        }
    });
});

//edit
router.get("/:id/edit",middleware.hasPermission, function(req, res) {
    Act.findById(req.params.id, function(e,found){
        res.render("activity/edit",{act:found});                
    });
});


//update
router.put("/:id",middleware.hasPermission, upload.single('image'), function(req,res){
    cloudinary.uploader.upload(
        req.file.path, function(result){
            req.body.act.image=result.secure_url;
            Act.findByIdAndUpdate(req.params.id, req.body.act, function(e,update){
            if(e) res.redirect("/activity");
            else res.redirect("/activity/"+req.params.id);
                })
            }
        )
    
})

//destroy
router.delete("/:id",middleware.hasPermission, function(req,res){
    Act.findByIdAndRemove(req.params.id, function(){
        res.redirect("/activity");
    });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


module.exports=router;
