
const express  = require('express'),
    app = express(),
    router = express.Router(),
    User = require('../../models/User'),
    { body, validationResult } = require('express-validator'),
    nodemailer = require('nodemailer'),
    smtpTransport = require('nodemailer-smtp-transport'),
    async = require('async'),
    crypto = require('crypto'),
    bcrypt = require('bcryptjs'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    EMAIL_ADDRESS = process.env.EMAIL_ADDRESS,
    EMAIL_PASS = process.env.EMAIL_PASS,
    FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID,
    FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET,
    FacebookStrategy = require('passport-facebook').Strategy;
    


  router.all('/*', (req, res, next)=>{
      req.app.locals.layout = 'logins'
      next()
  })  

  router.get('/signin', (req, res)=>{
      res.render('home/login', {title: 'Signin'})
  })


  router.get('/signup', (req, res)=>{
    res.render('home/register', {title: 'Signup'})
})


router.get('/forgot', (req, res)=>{
    res.render('home/forgot', {title: 'Forgot'})
})





router.post('/signup', (req, res)=>{
    // validating using express-validator
   body('fullname', 'Fullname is required').notEmpty();
   body('fullname', 'Fullname should not be less than five characters').isLength({min: 5});
   body('email', 'Email is required').notEmpty();
   body('email', 'Email is invalid').isEmail();
   body('password', 'Password is required').notEmpty();
   body('password', 'Password should not be less than eight characters').isLength({min: 8});

    let errors = validationResult(req);
    if(!errors.isEmpty()){
        let messages = []
        errors.forEach(error=>{
            messages.push(error.msg)
            res.redirect('/logs/signup')
        })
        req.flash('error', messages);
    }else{

        User.findOne({email: req.body.email})
        .then(user=>{
            if(user){
                req.flash('error_msg', 'Email already exists')
                res.redirect('/logs/signup')
            }else{
                const newUser = new User()
                newUser.email = req.body.email;
                newUser.fullname = req.body.fullname;
                newUser.password = req.body.password;
    
                bcrypt.genSalt(10, (err, salt)=>{
                    bcrypt.hash(req.body.password, salt, (err, hash)=>{
                        if(err)console.log(err)
                        newUser.password = hash

                        if(req.body.role){
                            newUser.role = req.body.role  // Assigning managerial priviledges to an account
                        }

                        newUser.save()
                        .then(savedUser=>{
                            req.flash('success_msg', 'Account created. Signin now')
                            res.redirect('/logs/signin')
                        })
                        .catch(err=>console.log(err))
                    })
                })
    
            }
        })
        .catch(err=>console.log(err))
    }   
})



// implementing passport for sign in
passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done)=>{
    User.findOne({email: email})
    .then(user=>{
        if(!user){
            return done(null, false, {message: 'Email not recognised. Try again!'});
        }else{
            bcrypt.compare(password, user.password, (err, matched)=>{
                if(err)console.log(err);

                if(!matched){
                    return done(null, false, {message: 'Password mismatch. Try again!'});
                }else{
                    console.log(`logged in as ${user.email} -> ${user.role}`)
                    return done(null, user)
                }
            })
        }
    })
    .catch(err=>console.log(err))
}))



passport.serializeUser(function(user, done) {
    done(null, user.id);
});
  
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
});

router.post('/signin', passport.authenticate('local', {
        // successRedirect: '/admin',
        failureRedirect: '/logs/signin',
        failureFlash: true
}),(req, res)=>{
    if(req.body.remember){
        req.session.cookie.maxAge = 30*24*60*60*1000  // session for thirty 30
    }else{
        req.session.cookie.expires = null
    }
    User.findOne({email: req.body.email})
    .then(user=>{
        if(user.role === 'Admin'){
            res.redirect('/admin')
        }else{
            res.redirect('/user')
        }
    })
    .catch(err=>console.log(err))
})



// facebook passport strategy
passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:1777/logs/auth/facebook/callback",
    profileFields: ['id', 'email', 'name', 'picture.type(large)'],
    passReqToCallback: true
  },
  function(req, accessToken, refreshToken, profile, done) {
    User.findOne({facebookID: profile.id})
    .then(user=>{
        console.log(profile)
        if(user){
           return done(null, user);
        }else{
            let newUser = new User()
            if(profile._json.email){
                newUser.email = profile._json.email;
            }else{
                newUser.email = `${profile._json.first_name}@gmail.com`
            }        
            newUser.facebookID = profile .id;
            newUser.fullname = profile.displayName;
            newUser.tokens.push({accessToken: accessToken})
            newUser.save()
            .then(user=>{
             return done(null, user);
            })
            .catch(err=>{
                 done(null, err)
            })
        }
    })
    .catch(err=>{
        console.log(err)
    })
  }
));


router.get('/auth/facebook', passport.authenticate('facebook', {scope: ['public_profile', 'email']} ));


router.get('/auth/facebook/callback', passport.authenticate('facebook',
   { successRedirect: '/user',
    failureRedirect: '/logs/sign' 
   }
));



router.post('/forgot', (req, res, next)=>{
    async.waterfall([
        function(callback){
            crypto.randomBytes(20, (err, buf)=>{
                if(err)console.log(err)
                let token = buf.toString('hex')
                callback(err, token)
            })
        },

        function(token, callback){
            User.findOne({email: req.body.email})
            .then(user=>{
                if(!user){
                    req.flash('error_msg', 'Email not recognized!');
                    res.redirect('/logs/forgot');
                }else{
                    user.passwordResetToken = token;
                    user.passwordResetExpires = Date.now() + 60*60*1000;
                    user.save(err=>{
                        callback(err, token, user)
                    })
                    
                }
            })

        },

        function(token, user, callback){

            
            // let transporter = nodemailer.createTransport({
            //     host: 'smtp.gmail.com',
            //     port: 465,
            //     secure: true,
            //     auth: {
            //         type: 'OAuth2',
            //         clientId: '000000000000-xxx.apps.googleusercontent.com',
            //         clientSecret: 'XxxxxXXxX0xxxxxxxx0XXxX0'
            //     }
            // });
            
            // let mailOptions = {
            //     from: 'nodeRatingx ' + '<' + EMAIL_ADDRESS + '>',
            //     to: user.mail,
            //     subject: 'nodeRatingx Reset Link',
            //     text: 'Hello there, you requested to have your password reset. \n\n' + 
            //             'Use this link to reset you password now: \n\n' +
            //             'http://localhost:1777/logs/reset/'+token + '\n\n',
            //     auth: {
            //         user:  EMAIL_ADDRESS,
            //         refreshToken: '1/XXxXxsss-xxxXXXXXxXxx0XXXxxXXx0x00xxx',
            //         accessToken: 'ya29.Xx_XX0xxxxx-xX0X0XxXXxXxXXXxX0x',
            //         expires: 1484314697598
            //     }
            // };

            // transporter.sendMail(mailOptions, (err, response)=>{
            //     if(err)console.log(err);
            //     req.flash('success_msg', `Password reset link has been sent to ${user.email}!`);
            //     return callback(err, user)
            // })




           let smtpTransport = nodemailer.createTransport({
                host: "smtp.gmail.com",
                auth: {
                    user: EMAIL_ADDRESS,
                    pass: EMAIL_PASS
                }
                
            })

            let mailOptions = {
                to: user.email,
                from: 'nodeRatingx ' + '<' + EMAIL_ADDRESS + '>',
                subject: 'nodeRatingx Reset Link',
                text: 'Hello there, you requested to have your password reset. \n\n' + 
                      'Use this link to reset you password now: \n\n' +
                      'http://localhost:1777/logs/reset/'+token + '\n\n' 
            }

            smtpTransport.sendMail(mailOptions, (err, response)=>{
                if(err)console.log(err);
                req.flash('success_msg', `Password reset link has been sent to ${user.email}!`);
                return callback(err, user)
            })





        }
        
    ], err=>{
        if(err){
         return next(err)
        }
        res.redirect('/logs/forgot')
    })
    
    
   
})



router.get('/reset/:token', (req, res)=>{

    User.findOne({passwordResetToken: req.params.token, passwordResetExpires: {$gt: Date.now() }})
    .then(user=>{
        if(!user){
            req.flash('error_msg', 'Token is unrecognised, it has expired/invalid. Try again!')
            res.redirect('/logs/forgot')
        }else{
             res.render('home/reset', {title: 'Reset', user: user.id, token: req.params.token})
        }
    })

})


router.post('/reset', (req, res,next)=>{
    async.waterfall([
        function(callback){
            User.findOne({_id: req.body.user_id})
            .then(user=>{
                if(req.body.password !== req.body.confirm_password){
                    req.flash('error_msg', 'Password mismatch. Try again!')
                    res.redirect(`/logs/reset/${req.body.token}`)
                }else{
                    bcrypt.genSalt(10, (err, salt)=>{
                        bcrypt.hash(req.body.password, salt, (err, hash)=>{
                            if(err)console.log(err)
                            user.password = hash
                            user.passwordResetExpires = ''
                            user.passwordResetToken = ''
                            user.save(err=>{
                                req.flash('success_msg', 'Password reset success. Login now!')
                                callback(err, user)
                            })
                        })
                    })
                }
            })
        },

        function(user, callback){

            let transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    type: 'OAuth2',
                    clientId: '000000000000-xxx.apps.googleusercontent.com',
                    clientSecret: 'XxxxxXXxX0xxxxxxxx0XXxX0'
                }
            });
            
            let mailOptions = {
                from: 'nodeRatingx ' + '<' + EMAIL_ADDRESS + '>',
                to: user.mail,
                subject: 'Password Reset Success',
                text: 'Hello there, you password has been reset to have your password reset. \n\n' + 
                      'Always remember to login with the new password: \n\n' +
                      'This confirms that you have reset the password for'+ user.email +'\n\n' ,
                auth: {
                    user:  EMAIL_ADDRESS,
                    refreshToken: '1/XXxXxsss-xxxXXXXXxXxx0XXXxxXXx0x00xxx',
                    accessToken: 'ya29.Xx_XX0xxxxx-xX0X0XxXXxXxXXXxX0x',
                    expires: 1484314697598
                }
            };

            transporter.sendMail(mailOptions, (err, response)=>{
                if(err)console.log(err);
                req.flash('success_msg', `Password reset link has been sent to ${user.email}!`);
                return callback(err, user)
            })



            // let smtpTransport = nodemailer.createTransport({
            //      host: "smtp.gmail.com",
            //     auth: {
            //         user: EMAIL_ADDRESS,
            //         pass: EMAIL_PASS
            //     }
                
            // })

            // let mailOptions = {
            //     to: user.email,
            //     from: 'nodeRatingx ' + '<' + EMAIL_ADDRESS + '>',
            //     subject: 'Password Reset Success',
            //     text: 'Hello there, you password has been reset to have your password reset. \n\n' + 
            //           'Always remember to login with the new password: \n\n' +
            //           'This confirms that you have reset the password for'+ user.email +'\n\n' 
            // }

            // smtpTransport.sendMail(mailOptions, (err, response)=>{
            //     if(err)console.log(err);
            //     return callback(err, user)
            // })



        }

    ], err=>{
        if(err){
            return next(err)
        }
        res.redirect('/logs/signin')
    })
 
})


router.get('/logout', (req, res)=>{
    req.logout()
    req.session.destroy(err=>{
        res.redirect('/')
    })
})


module.exports = router;