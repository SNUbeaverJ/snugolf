var express = require('express');
var BoardContents = require('../models/notice'); //db를 사용하기 위한 변수
var router = express.Router();
var middleware=require("../middleware")


router.get("/", function(req,res){
    res.redirect("/notice/list/1");
})

router.get("/list/:page", function(req,res){
    res.render
})

module.exports=router;