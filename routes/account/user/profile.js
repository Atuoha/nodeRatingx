const express = require('express'),
    app = express(),
    router = express.Router(),
    User = require('../../../models/User'),
    Company = require('../../../models/Company'),
    fs = require('fs'),
    bcrypt = require('bcryptjs'),
    { isEmpty } = require('../../../helpers/upload-helpers'),
    { userAuth } = require('../../../helpers/authenticate');
    
   





router.all('/*', userAuth, (req, res, next)=>{
    req.app.locals.layout = 'user'
    next()
})


router.get('/', (req, res)=>{
    User.findOne({_id: req.user.id})
    .populate('company')
    .then(profile=>{
        res.render('accounts/user/profile', {title: 'Profile|User', profile: profile})
    })
    .catch(err=>console.log(err))
})


router.get('/edit/:id', (req, res)=>{
    User.findOne({_id: req.params.id})
    .then(profile=>{
        Company.find()
        .then(companies=>{
         res.render('accounts/user/profile/edit', {title: 'Edit|Profile', profile: profile, companies: companies})
        })
        .catch(err=>console.log(err))
    })
    .catch(err=>console.log(err))
})




router.get('/edit/:id/company/:comp_id', (req, res)=>{
    User.findOne({_id: req.params.id})
    .populate('company')
    .then(profile=>{
        Company.findOne({_id: req.params.comp_id})
        .populate('company')
        .then(company=>{
            res.render('accounts/user/profile/edit', {title: 'Edit|Profile', profile: profile, company: company})
        })
        .catch(err=>console.log(err))
        
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

        let company = profile.company
        if(req.body.company){
            company = req.body.company
        }

        if(req.body.password){
            profile.fullname = req.body.fullname
            profile.email = req.body.email
            profile.phone = req.body.phone
            profile.company = company

            profile.file = filename

            bcrypt.genSalt(10, (err, salt)=>{
                bcrypt.hash(req.body.password, salt, (err, hash)=>{
                    if(err)console.log(err)
                    profile.password = hash
                    .then(response=>{
                        req.flash('success_msg', 'Profile updated :)')
                        res.redirect('/user/profile')
                    })
                    .catch(err=>console.log(err))
                })
            })
        }else{
            profile.fullname = req.body.fullname
            profile.email = req.body.email
            profile.phone = req.body.phone
            profile.company = company
            profile.file = filename
            profile.save()
            .then(response=>{
                req.flash('success_msg', 'Profile updated :)')
                res.redirect('/user/profile')
            })
            .catch(err=>console.log(err))
        }
       
    })
    .catch(err=>console.log(err))
})

module.exports = router;    
