const { response } = require("express");

const express = require('express'),
    app = express(),
    router = express.Router(),
    Company = require('../../../models/Company'),
    faker = require('faker'),
    fs = require('fs'),
    { isEmpty } = require('../../../helpers/upload-helpers');




router.all('/*', (req, res, next)=>{
    req.app.locals.layout = 'user'
    next()
})    


router.get('/', (req, res)=>{
    Company.find({user: req.user})
    .then(companies=>{
        res.render('accounts/user/company', {title: 'User|Company', companies: companies})
    })
    .catch(err=>console.log(err))
})

router.get('/create', (req, res)=>{
    if(req.user.role !== 'Manager'){
        req.flash('error_msg', 'Access Denied ):')
        res.redirect('/user/company')
    }
    res.render('accounts/user/company/create', {title: 'Company|Create'});
})


router.get('/dummy', (req, res)=>{
    if(req.user.role !== 'Manager'){
        req.flash('error_msg', 'Access Denied ):')
        res.redirect('/user/company')
    }
    res.render('accounts/user/company/dummy', {title: 'company|Dummy'})
})


router.get('/edit/:id', (req, res)=>{
    if(req.user.role !== 'Manager'){
        req.flash('error_msg', 'Access Denied ):')
        res.redirect('/user/company')
    }
    Company.findOne({_id: req.params.id})
    .then(company=>{
        res.render('accounts/user/company/edit', {title: 'Company|Edit', company: company})
    })
    .catch(err=>console.log(err))
})

router.get('/show/:id', (req, res)=>{
    Company.findOne({_id: req.params.id})
    .then(company=>{
        res.render('accounts/user/company/show', {title: 'Company|Show', company: company})
    })
    .catch(err=>console.log(err))
})


router.post('/create', (req, res)=>{
    if(req.user.role !== 'Manager'){
        req.flash('error_msg', 'Access Denied ):')
        res.redirect('/user/company')
    }
    Company.findOne({name: req.body.name})
    .then(company=>{
        if(company){
            req.flash('error_msg', 'Company Already Exists...')
            res.redirect('/user/company')
        }else{
            // uploading file
            let filename = ''
            if(!isEmpty(req.files)){
                const file = req.files.file
                filename = Date.now() + '-' + file.name
                const uploadDir = './public/uploads/'
                file.mv(uploadDir + filename, err=>{
                    if(err)console.log(err)
                })
            }

            const newCompany = new Company()
            newCompany.name = req.body.name
            newCompany.address = req.body.address
            newCompany.city = req.body.city
            newCompany.country = req.body.country
            newCompany.sector = req.body.sector
            newCompany.website = req.body.website
            newCompany.file = filename
            newCompany.user = req.user
            newCompany.save()
            .then(response=>{
                req.flash('success_msg', 'Company registered successfully')
                res.redirect('/user/company')
            })
            .catch(err=>console.log(err))
 
        }
    })
    .catch(err=>console.log(err))
})


router.post('/dummy', (req, res)=>{
    if(req.user.role !== 'Manager'){
        req.flash('error_msg', 'Access Denied ):')
        res.redirect('/user/company')
    }
    for(let i = 0; i < req.body.number; i++){
        const newCompany = new Company()
        newCompany.name = faker.lorem.title()
        newCompany.address = 'No 10 Address-Line'
        newCompany.sector = faker.random.word()
        newCompany.website = 'www'+faker.random.word()+'.com'
        newCompany.country = 'Country'
        newCompany.city = 'City'
        newCompany.file = 'img_place.png'
        newCompany.user = req.user
        newCompany.save()
        .then(response=>{
            req.flash('success_msg', `${req.body.number} dummy companies created :)`)
            res.redirect('/user/company')
        })
        .catch(err=>console.log(err))

    }
})


router.put('/update/:id', (req, res)=>{
    if(req.user.role !== 'Manager'){
        req.flash('error_msg', 'Access Denied ):')
        res.redirect('/user/company')
    }
    Company.findOne({_id: req.params.id})
    .then(company=>{
        let filename = company.file
        if(!isEmpty(req.files)){
            const file = req.files.file
            filename = Date.now()+'-'+file.name
            const uploadDir = './public/uploads/'
            file.mv(uploadDir+filename, err=>{
                if(err)console.log(err)
            })

            if(company.file !== 'img_place.png' && company.file !== ''){
                let delDir = './public/uploads/'
                fs.unlink(delDir+company.file, err=>{
                    if(err)console.log(err)
                })
            }
        }

        company.name = req.body.name
        company.address = req.body.address
        company.city = req.body.city
        company.country = req.body.country
        company.sector = req.body.sector
        company.website = req.body.website
        company.file = filename
        company.save()
        .then(response=>{
            req.flash('success_msg', `${response.name} has been updated :)`)
            res.redirect('/user/company')
        })
        .catch(err=>console.log(err))

    })
    .catch(err=>console.log(err))
})



router.delete('/delete/:id', (req, res)=>{
    if(req.user.role !== 'Manager'){
        req.flash('error_msg', 'Access Denied ):')
        res.redirect('/user/company')
    }
    Company.findOne({_id: req.params.id})
    .then(company=>{

        if(company.file !== 'img_place.png' && company.file !== ''){
            let delDir = './public/uploads/'
            fs.unlink(delDir+company.file, err=>{
                if(err)console.log(err)
            })
        }

        company.delete()
        .then(response=>{
            req.flash('success_msg', `${response.name} has been deleted :)`)
        })
        .catch(err=>console.log(err))

    })
    .catch(err=>console.log(err))
})

module.exports = router;
