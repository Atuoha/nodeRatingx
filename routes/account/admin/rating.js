
const express = require('express'),
    app = express(),
    router = express.Router(),
    Company = require('../../../models/Company'),
    User = require('../../../models/User'),
    Rating = require('../../../models/Rating'),
    { adminAuth } = require('../../../helpers/authenticate');
    
   





router.all('/*', adminAuth, (req, res, next)=>{
    req.app.locals.layout = 'admin'
    next()
})    


router.get('/', (req, res)=>{
    // Company.find({user: req.user})'
    Company.find()
    .then(companies=>{
        res.render('accounts/admin/company/subscribers_company_views', {title: 'Admin|Company', companies: companies})
    })
    .catch(err=>console.log(err))
})


router.get('/create/:id', (req, res)=>{

    if(!req.user){
        req.flash('error_msg', 'Sign in to rate company')
        res.redirect('back')
    }

    
    // Company.find({user: req.user})'
    Company.findOne({_id: req.params.id})
    .then(company=>{
        res.render('accounts/admin/rating/create', {title: 'Rating|Company', company: company})
    })
    .catch(err=>console.log(err))
})


router.post('/create/:id', (req, res)=>{

  
    
    const newRating = new Rating()
    newRating.rating = req.body.rating
    newRating.review = req.body.review
    newRating.company = req.body.company
    newRating.user = req.user
    newRating.save()
    .then(response=>{
        Company.findOne({_id: req.params.id})
        .then(company=>{
            company.ratingSum += parseInt(req.body.rating)
            company.ratingNumber += 1
            company.ratingPoints.push(req.body.rating)

            company.save()
            .then(response=>{
                res.redirect(`/admin/company/show/${req.body.company}`)
            }) 
            .catch(err=>console.log(err))
        })
        .catch(err=>console.log(err))
    })
    .catch(err=>console.log(err))
})


module.exports = router
