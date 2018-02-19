var middlewareO={};
var Act=require("../models/act.js");
var Comment=require("../models/comment.js");
var Board=require("../models/board.js");
middlewareO.hasPermission= function(req,res,next){
    if(req.isAuthenticated()){
        Act.findById(req.params.id, function(e,found){
            if (e ) {
                //|| !found
                req.flash("error","DB 오류. 관리자에게 문의하십시오.");
                res.redirect("back");
            }
            else{
                if(req.user.isAdmin||found.author.id.equals(req.user._id)){
                    next();              
                }else{
                    req.flash("error", "권한이 없습니다.")
                    res.redirect("back");
                }
            }
        })    
    }else{
        //not logged
        req.flash("error", "로그인이 필요합니다.")
        res.redirect("back");
    }
};
middlewareO.hasBoardPermission= function(req,res,next){
    if(req.isAuthenticated()){
        Board.findById(req.params.b_id, function(e,found){
            if ((e)) {
                //  || !found
                req.flash("error","DB 오류. 관리자에게 문의하십시오.");
                res.redirect("back");
            }
            else{
                if(req.user.isAdmin||found.author.id.equals(req.user._id)){
                    next();              
                }else{
                    req.flash("error", "권한이 없습니다.")
                    res.redirect("back");
                }
            }
        })    
    }else{
        //not logged
        req.flash("error", "로그인이 필요합니다.")
        res.redirect("back");
    }
};




middlewareO.hasCommentPermission=function(req,res,next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.c_id, function(e,found){
            if (e || !found) {
                req.flash("error", "DB 오류. 관리자에게 문의하십시오.")
                res.redirect("back");
            }
            else{
                if(found.author.id.equals(req.user._id)){
                    next();              
                }else{
                    req.flash("error", "권한이 없습니다.")
                    res.redirect("back");
                }
            }
        })    
    }else{
        //not logged
        req.flash("error", "로그인이 필요합니다.")
        res.redirect("back");
    }
}


middlewareO.isLoggedIn=function(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "로그인이 필요합니다.")
    req.session.returnTo=req.path;
    res.redirect("/login");
}

module.exports=middlewareO;