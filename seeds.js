var mongoose=require("mongoose");
var Act= require("./models/act");
var Comment=require("./models/comment");
var Board=require("./models/board");
var Boardob=require("./models/boardob");
var User=require("./models/user")
function seedDB(){
    User.remove({},function(e){
        if(e) console.log(e);
        console.log("all acount removed");
    })
    // Act.remove({},function(e){
    //     if(e) console.log(e);
        
    //     console.log("removed");
    
    // })
    // Board.remove({},function(e){
    //     if(e) console.log(e);
        
    //     console.log("removed");
    
    // })   
    // Boardob.remove({},function(e){
    //     if(e) console.log(e);
        
    //     console.log("removed");
    
    // })  ;
    
}


module.exports=seedDB;