var express= require("express");
var router= express.Router();
var Board= require("../models/board.js");
var middleware= require("../middleware");

router.get("/", function(req,res){
    var perPage=6;
    var pageQuery=parseInt(req.query.page);
    var pageNumber= pageQuery ? pageQuery :1;
    var noMatch =null;
    
    if(req.query.search){
        const regex= new RegExp(escapeRegex(req.query.search),'gi');
        Board.find({title:regex}).skip((perPage*pageNumber)-perPage).limit(perPage).exec(function(e,act){
            Board.count({title:regex}).exec(function(e,count){
                if(e)console.log("ERROR");
                else{
                    if(act.length<1) req.flash('error', "검색 결과가 존재하지 않습니다.");
                    else res.render("board/board_yb",{
                        board:act,
                        current: pageNumber,
                        pages:Math.ceil(count/perPage),
                        noMatch: noMatch,
                        search: req.query.search
                    });          
                }
            })
    });
    }
    Board.find({}).sort('-created').skip((perPage*pageNumber)-perPage).limit(perPage).exec(function(e,act){
        Board.count().exec(function(e,count){
            if(e)console.log("ERROR");
            else{
                if(e) console.log("error");
                else res.render("board/board_yb",{
                    board:act,
                    current:pageNumber,
                    pages: Math.ceil(count/perPage),
                    noMatch: noMatch,
                    search:false
                    
                });  
            }
            
        })
    });
})  ;

router.get("/new",middleware.isLoggedIn ,function(req, res) {
    res.render("board/new_yb");
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
    Board.create(newAct, function(e){
        if(e){
            console.log(e);
        }else {
            req.flash("success", "게시글을 작성했습니다.")
            res.redirect("/board");}
    });
        
});
router.get("/:b_id", function(req, res) {
    //find act with such id and show info
    Board.findById(req.params.b_id).populate("comments").exec(function(e, found){
    // Board.findById(req.params.b_id, function(e, found){
        if(e || !found) {
            req.flash("error","DB오류. 관리자에게 문의하십시오.");
            res.redirect("back");
        }
        else  {
            //console.log(found);
            res.render("board/show_yb", {blog:found}
            );
        }
    });
});

//edit
router.get("/:b_id/edit",middleware.hasBoardPermission, function(req, res) {
    Board.findById(req.params.b_id, function(e,found){
        res.render("board/edit_yb",{blog:found});         
    });
});


//update
router.put("/:b_id",middleware.hasBoardPermission, function(req,res){
    Board.findByIdAndUpdate(req.params.b_id, {title:req.body.title, body:req.body.body}, function(e,update){
        if(e) res.redirect("/board");
        else res.redirect("/board/"+req.params.b_id);
    })
})

// //destroy
router.delete("/:b_id",middleware.hasBoardPermission, function(req,res){
    Board.findByIdAndRemove(req.params.b_id, function(){
        res.redirect("/board");
    });
});


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


module.exports=router;
