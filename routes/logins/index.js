const express  = require('express'),
    app = express(),
    router = express.Router(),
    User = require('../../models/User')
    bcrypt = require('bcryptjs'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;


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


router.post('/signup', (req, res)=>{
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
})



// implementing passport for sign in

passport.use(new LocalStrategy({usernameField: email}), (email, password, done)=>{
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
                    return done(null, user)
                }
            })
        }
    })
    .catch(err=>console.log(err))
})



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



router.get('/logout', (req, res)=>{
    req.logout()
    res.redirect('/')
})


module.exports = router;