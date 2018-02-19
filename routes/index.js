var express=require("express");
var router = express.Router();
var passport= require("passport");
var User= require("../models/user");
var middleware=require("../middleware");
var async= require("async");
var nodemailer=require("nodemailer");
var crypto= require("crypto");

router.get("/",function(req,res){
    res.render("landing");
});

router.get("/about",function(req,res){
    res.render("about");
})


//auth

router.get("/register",function(req, res) {
    res.render("register");
})
router.post("/register", function(req, res) {
    if(req.body.CODE!="snugolf0201"){
      req.flash("error", "승인 코드가 잘못되었습니다. 주장단에 문의해주세요");
      return res.redirect("register");
    } 
    else{
    var newUser= new User({username:req.body.username, email:req.body.email});
    if(req.body.username==="Admin") newUser.isAdmin=true;
    User.register(newUser, req.body.password, function(e,user){
        if(e) {
            req.flash("error", e.message);
            return res.redirect("register");
        }
        passport.authenticate("local")(req,res, function(){
            req.flash("success", "환영합니다.")
            res.redirect("/");
        })
    });
    };
});

router.get("/login", function(req, res) {
    res.render("login");
});
router.post("/login", passport.authenticate("local", {
        successRedirect:"/",
        // successReturnToOrRedirect
        failureRedirect:"/login"
    }),function(req, res) {
        res.redirect("back");
});
router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "로그아웃 되었습니다.");
    res.redirect("/");
});

router.get("/forgot", function(req, res) {
    res.render("forgot");
})
router.post("/forgot", function(req,res,next){
    async.waterfall([
        function(done){
            crypto.randomBytes(20,function(e,buf){
                var token= buf.toString('hex');
                done(e,token);
            });
        },
        function(token, done){
            User.findOne({ email: req.body.email}, function(e,user){
                if(!user){
                    req.flash('error',"이메일에 해당하는 계정이 존재하지 않습니다.");
                    return res.redirect("/forgot");
                }
                user.resetPasswordToken= token;
                user.resetPasswordExpires= Date.now()+3600000;
                user.save(function(e){
                    done(e,token,user);
                });
            });
        },
        function(token,user,done){
            var smtpTransport=nodemailer.createTransport({
                service: 'Gmail',
                auth:{
                    user: 'snugolf@gmail.com',
                    pass: "snugolf0201"
                }
            });
            var mailOption={
                to: user.email,
                from: "snugolf@gmail.com",
                subject:"Password Reset",
                text: "비밀번호를 재설정 합니다. 아래의 링크를 클릭하여 비밀번호 설정을 완료해 주시기 바랍니다."+
                "http://"+req.headers.host+"/reset/"+token+"\n\n"+
                "만약 본인이 비밀번호를 재설정하지 않았다면 발신 주소로 문의하여 주시기 바랍니다."
            };
            smtpTransport.sendMail(mailOption,function(e){
                console.log("mail sent");
                req.flash('success', "비밀번호 재설정 메일이 발송되었습니다. 메일로 이동하여 비밀번호 재설정을 완료해 주시기 바랍니다.")
                done(e,'done');
            });
        }
        ], function(e){
            if(e) return next(e);
            res.redirect('/forgot');
        });
});

router.get('/reset/:token', function(req, res) {
    User.findOne({resetPasswordToken:req.params.token, resetPasswordExpires:{$gt:Date.now()}}, function(e,user){
        if(!user){
            req.flash('error',"비밀번호 재설정이 만료되었습니다. 다시 시도해 주시기 바랍니다.");
            return res.redirect("/forgot");
            
        }
        res.render('reset',{token:req.params.token});
    });
});

router.post('/reset/:token', function(req,res){
    async.waterfall([
        function(done){
            User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires:{$gt:Date.now()}}, function(e, user) {
                if(!user){
                    req.flash("error","비밀번호 재설정이 만료되었습니다. 다시 시도해 주시기 바랍니다.");
                    return res.redirect("back");
                }
                if(req.body.password==req.body.confirm){
                    user.setPassword(req.body.password, function(e){
                        user.resetPasswordToken=undefined;
                        user.resetPasswordExpires=undefined;
                        
                        user.save(function(e){
                            req.logIn(user, function(e){
                                done(e, user);
                            });
                        });
                    })
                } else{
                    req.flash("error", "패스워드가 일치하지 않습니다");
                    return res.redirect('back');
                }
            });
        }, function(user,done){
            var smtpTransport=nodemailer.createTransport({
                service:"Gmail",
                auth:{
                    user:"snugolf@gmail.com",
                    pass:"snugolf0201"
                }
            });
            var mailOptions={
                to: user.email,
                from: "snugolf@gmail.com",
                subject:"패스워드 변경을 알려드립니다.",
                text: Date.now()+"에 서울대학교 골프부 사이트 암호가 변경되었스빈다. 본인이 바꾼것이 아닐경우 해당메일로 회신해 주시기 바랍니다. "
            };
            smtpTransport.sendMail(mailOptions, function(e){
                req.flash('success', "패스워드가 성공적으로 변경되었습니다.")
                done(e);
            });
        }
        ], function(e){
            res.redirect('/');
        });
});




module.exports=router;