const express = require('express'),
    app = express(),
    router = express.Router(),
    User = require('../../../models/User'),
    fs = require('fs'),
    bcrypt = require('bcryptjs'),
    { isEmpty } = require('../../../helpers/upload-helpers');

    
router.all('/*', (req, res, next)=>{
    req.app.locals.layout = 'admin'
    next()
})


router.get('/', (req, res)=>{
    User.findOne({_id: req.user.id})
    .populate('company')
    .then(profile=>{
        res.render('accounts/admin/profile', {title: 'Profile|User', profile: profile})
    })
    .catch(err=>console.log(err))
})


router.get('/edit/:id', (req, res)=>{
    User.findOne({_id: req.params.id})
    .then(profile=>{
        res.render('accounts/admin/profile/edit', {title: 'Edit|Profile', profile: profile})
    })
    .catch(err=>console.log(err))
})


router.put('/:id/update', (req, res)=>{
    User.findOne({_id: req.params.id})
    .then(profile=>{
        let filename = profile.file
        if(!isEmpty(req.files)){
            let file = req.files.file
            filename = Date.now() + '-' + file.name
            let uploadDir = './public/uploads/'
            file.mv(uploadDir+filename, err=>{
                if(err)console.log(err)
            })

            if(profile.file !== '' && profile.file !== 'default.png'){
                let delDir = './public/uploads/'
                fs.unlink(delDir+profile.file, err=>{
                    if(err)console.log(err)
                })
            }
        }

        if(req.body.password){
            profile.fullname = req.body.fullname
            profile.email = req.body.email
            profile.file = filename

            bcrypt.genSalt(10, (err, salt)=>{
                bcrypt.hash(req.body.password, salt, (err, hash)=>{
                    if(err)console.log(err)
                    profile.password = hash
                    .then(response=>{
                        req.flash('success_msg', 'Profile updated :)')
                        res.redirect('/admin/profile')
                    })
                    .catch(err=>console.log(err))
                })
            })
        }else{
            profile.fullname = req.body.fullname
            profile.email = req.body.email
            profile.file = filename
            profile.save()
            .then(response=>{
                req.flash('success_msg', 'Profile updated :)')
                res.redirect('/admin/profile')
            })
            .catch(err=>console.log(err))
        }
       
    })
    .catch(err=>console.log(err))
})

module.exports = router;    
