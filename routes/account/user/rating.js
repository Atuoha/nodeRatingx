
const express = require('express'),
    app = express(),
    router = express.Router(),
    Company = require('../../../models/Company'),
    User = require('../../../models/User'),
    Rating = require('../../../models/Rating');




router.all('/*', (req, res, next)=>{
    req.app.locals.layout = 'user'
    next()
})    


router.get('/', (req, res)=>{
    // Company.find({user: req.user})'
    Company.find()
    .then(companies=>{
        res.render('accounts/user/company/subscribers_company_views', {title: 'User|Company', companies: companies})
    })
    .catch(err=>console.log(err))
})


router.get('/create/:id', (req, res)=>{
    // Company.find({user: req.user})'
    Company.findOne({_id: req.params.id})
    .then(company=>{
        res.render('accounts/user/rating/create', {title: 'Rating|Company', company: company})
    })
    .catch(err=>console.log(err))
})


module.exports = router
