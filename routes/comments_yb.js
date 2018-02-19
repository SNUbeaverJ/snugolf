var express= require("express");
var router= express.Router({mergeParams:true});
var Board= require("../models/board.js");
var Comment=require("../models/comment.js");
var middleware=require("../middleware");

router.get("/new",middleware.isLoggedIn,function(req, res) {
    Board.findById(req.params.b_id, function(e,data){
        if(e) console.log(e);
        else{
            res.render("comment/new_yb", {act:data});
        }
    });
});
router.post("/",middleware.isLoggedIn,function(req,res){
    Board.findById(req.params.b_id, function(e,data){
        if(e) {console.log(e); res.redirect("/board");}
        else{
            Comment.create(req.body.comment,function(e,ddata){
                if (e);
                else {
                    ddata.author.id=req.user._id;
                    ddata.author.username=req.user.username;
                    ddata.save();
                    data.comments.push(ddata._id);
                    data.save();
                    req.flash("success", "게시글에 답변을 작성했습니다.")
                    res.redirect("/board/" +data._id);
                }
            })
        }
    })
})


//edit
router.get("/:c_id/edit",middleware.hasCommentPermission, function(req,res){
    Comment.findById(req.params.c_id, function(e, data) {
        if(e) res.redirect("back");
        else res.render("comment/edit_yb",{act_id:req.params.b_id, comment:data});
    });
});

//update
router.put("/:c_id",middleware.hasCommentPermission, function(req,res){
    Comment.findByIdAndUpdate(req.params.c_id, req.body.comment, function(e,data){
        if(e) res.redirect("back");
        else res.redirect("/board/"+req.params.b_id);
    });
});
//destroy
router.delete("/:c_id" ,middleware.hasCommentPermission, function(req,res){
    Comment.findByIdAndRemove(req.params.c_id,function(e){
        if(e) res.redirect("back");
        else {
            req.flash("success", "답변을 삭제했습니다.")
            res.redirect("/board/"+req.params.b_id);
        }
    });
});




module.exports=router;