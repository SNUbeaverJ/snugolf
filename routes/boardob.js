var express= require("express");
var router= express.Router();
var Boardob= require("../models/boardob.js");
var middleware= require("../middleware");

router.get("/", function(req,res){
    var perPage=6;
    var pageQuery=parseInt(req.query.page);
    var pageNumber= pageQuery ? pageQuery :1;
    var noMatch =null;
    if(req.query.search){
        const regex= new RegExp(escapeRegex(req.query.search),'gi');
        Boardob.find({title:regex}).skip((perPage*pageNumber)-perPage).limit(perPage).exec(function(e,act){
            Boardob.count({title:regex}).exec(function(e,count){
                if(e)console.log("ERROR");
                else{
                    if (act.length<1) req.flash('error', "검색결과가 존재하지 않습니다.");
                    else res.render("board/board_ob",{
                        board:act,
                        current: pageNumber,
                        pages: Math.ceil(count/perPage),
                        noMatch: noMatch,
                        search: req.query.search
                    });
                }
                
            })
    });
    }
    Boardob.find({}).sort('-created').skip((perPage*pageNumber)-perPage).limit(perPage).exec(function(e,act){
        Boardob.count().exec(function(e,count){
            if(e)console.log("ERROR");
            else res.render("board/board_ob",{
                board:act,
                current:pageNumber,
                pages: Math.ceil(count/perPage),
                noMatch:noMatch,
                search:false
            });    
        })
        
    });
})  ;

router.get("/new",middleware.isLoggedIn ,function(req, res) {
    res.render("board/new_ob");
});
router.post("/",middleware.isLoggedIn, function(req,res){
    var yb_title=req.body.title;
    var yb_content=req.body.body;
    var author={
        id:req.user._id,
        username:req.user.username
    };
    var newAct={title:yb_title, body:yb_content, author:author};
    //push to db
    Boardob.create(newAct, function(e){
        if(e){
            console.log(e);
        }else {
            req.flash("success", "게시글을 작성했습니다.")
            res.redirect("/boardob");}
    });
        
});
router.get("/:ob_id", function(req, res) {
    //find act with such id and show info
    Boardob.findById(req.params.ob_id).populate("comments").exec(function(e, found){
    // Board.findById(req.params.b_id, function(e, found){
        if(e || !found) {
            req.flash("error","DB오류. 관리자에게 문의하십시오.");
            res.redirect("back");
        }
        else  {
            //console.log(found);
            res.render("board/show_ob", {blog:found}
            );
        }
    });
});

//edit
router.get("/:ob_id/edit",middleware.hasBoardPermission, function(req, res) {
    Boardob.findById(req.params.ob_id, function(e,found){
        res.render("board/edit_ob",{blog:found});         
    });
});


//update
router.put("/:ob_id",middleware.hasBoardPermission, function(req,res){
    Boardob.findByIdAndUpdate(req.params.ob_id, {title:req.body.title, body:req.body.body}, function(e,update){
        if(e) res.redirect("/boardob");
        else res.redirect("/boardob/"+req.params.ob_id);
    })
})

// //destroy
router.delete("/:ob_id",middleware.hasBoardPermission, function(req,res){
    Boardob.findByIdAndRemove(req.params.ob_id, function(){
        res.redirect("/boardob");
    });
});


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


module.exports=router;
