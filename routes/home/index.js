const express  = require('express'),
    app = express(),
    router = express.Router(),
    Company = require('../../models/Company');


  router.all('/*', (req, res, next)=>{
      req.app.locals.layout = 'home'
      next()
  })  

  router.get('/', (req, res)=>{
      if(req.session.cookie.originalMaxAge != null){
          res.redirect('/admin')
      }else{
          res.render('home/index', {title: 'nodeRatingx|Home'})
      }
  })



  router.get('/company', (req, res)=>{
    const perPage = 5;
    const page = req.query.page || 1;

      Company.find()
      .skip((perPage * page) - perPage)
      .limit(perPage)
      .then(companies=>{
          Company.countDocuments()
          .then(companyCount=>{
            res.render('home/company', {title: 'Companies|Home', companies: companies, current: parseInt(page), pages: Math.ceil(companyCount/ perPage) })
          })
          .catch(err=>console.log(err))
      })
      .catch(err=>console.log(err))
  })



  router.get('/single_company/:id', (req, res)=>{
      Company.findOne({_id: req.params.id})
      .then(company=>{
        res.render('home/single_company', {title: `${company.name}`, company: company})
      })
      .catch(err=>console.log(err))
  })



module.exports = router;