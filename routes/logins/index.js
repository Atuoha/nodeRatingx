const express  = require('express'),
    app = express(),
    router = express.Router(),
    User = require('../../models/User'),
    { body } = require('express-validator'),
    nodemailer = require('nodemailer'),
    smtpTransport = require('nodemailer-smtp-transport'),
    ansync = require('ansync'),
    crypto = require('crypto'),
    bcrypt = require('bcryptjs'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    EMAIL_ADDRESS = process.env.EMAIL_ADDRESS,
    EMAIL_PASS = process.env.EMAIL_PASS
    


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


router.get('/reset', (req, res)=>{
    res.render('home/reset', {title: 'Reset'})
})



router.post('/signup', (req, res)=>{
    // validating using express-validator
    req.checkBody('fullname', 'Fullname is required').notEmpty();
    req.checkBody('fullname', 'Fullname should not be less than five characters').isLength({min: 5});
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is invalid').isEmail();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password', 'Password should not be less than eight characters').isLength({min: 8});
    req.checkBody('password', 'Password must contain at least one number').match('/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/');

    let errors = req.validationErrors();
    if(errors){
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
                    console.log(`logged in as ${user.email}`)
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

router.post('/login', (req, res, next)=>{

    passport.authenticate('local', {
        successRedirect: '/admin',
        failureRedirect: '/logs/signin',
        failureFlash: true
    })(req, res, next)
})



router.post('/forgot', (req, res)=>{
    ansync.waterfall([
        function(callback){
            crypto.randomBytes(20, (err, buf)=>{
                let token = buf.toString('hex')
                callback(err, token)
            })
        },

        function(token, callback){

            User.findOne({email: req.body.email})
            .then(user=>{
                if(!user){
                    req.flash('error_msg', 'Email not recognized!');
                    // return 'Email not recognized!';
                    res.redirect('/logs/forgot');
        
                }else{
                    user. passwordResetToken = token;
                    user.passwordResetExpires = Date.now() + 60*60*1000;
                    user.save(err=>{
                        callback(err, token, user)
                    })
                    // req.flash('success_msg', 'Password reset link has been sent!');
                    // // return 'Password reset link sent successfully'
                    // res.redirect('/logs/forgot');
                }
            })

        },

        function(token, user, callback){
             smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: EMAIL_ADDRESS,
                    pass: EMAIL_PASS
                }
                
            })

            let mailOptions = {
                to: user.email,
                from: 'nodeRatingx ' + '<' + EMAIL_ADDRESS + '>',
                subject: 'nodeRatingx Reset Link',
                text: 'Hello there, you requested to have your password resetted. \n\n Use this link to reset you password now: \n\n http://localhost:1777/email='+user.email+'token='+token 
            }
        }
       
    ])
   
})



router.post('/reset/:email/:token', (req, res)=>{

})


router.get('/logout', (req, res)=>{
    req.logout()
    res.redirect('/')
})


module.exports = router;