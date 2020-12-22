const express  = require('express'),
    app = express(),
    router = express.Router(),
    Company = require('../../models/Company'),
    Rating = require('../../models/Rating');


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
    .populate('user')
    .then(company=>{
        Rating.find({company: req.params.id})
        .populate('company')
        .populate('user')
        .then(ratings=>{
            let keys =  Object.keys(ratings);
            let ratingCount = keys.length
            let averageRating  = company.ratingSum/company.ratingNumber
            res.render('home/single_company', {title: `${company.name}`, company: company, ratings: ratings, ratingCount: ratingCount, averageRating: parseFloat(averageRating,1) })
        })
        .catch(err=>console.log(err))
    })
    .catch(err=>console.log(err))

  })



  router.get('/leaderboard', (req, res)=>{
    Company.find()
    .sort({'ratingSum': -1})
    .then(companies=>{
        res.render('home/leaderboard', {title: 'Leaderboard|nodeRatings', companies: companies})
    })
    .catch(err=>console.log(err))
})


router.get('/search', (req, res)=>{
  res.render('home/search', {title: 'Search|nodeRatings'})
})


router.post('/search', (req, res)=>{
    let name =  req.body.search
    let regex = new RegExp(name, 'i')

    Company.find({'$or': [{'name': regex}]})
    .then(companies=>{
      if(companies.length > 1){
        // found more than a company 
         res.render('home/company', {title: 'Searched|nodeRatings', companies: companies})
      }else{
        //  found a single company
          Company.findOne({'$or': [{'name': regex}]})
          .populate('user')
          .then(company=>{

            if(!company){
              req.flash('error_msg', 'No company with such name')
              res.redirect('/search')
            }


              Rating.find({company: req.params.id})
              .populate('company')
              .populate('user')
              .then(ratings=>{
                  let keys =  Object.keys(ratings);
                  let ratingCount = keys.length
                  let averageRating  = company.ratingSum/company.ratingNumber
                  res.render('home/single_company', {title: `${company.name}`, company: company, ratings: ratings, ratingCount: ratingCount, averageRating: parseFloat(averageRating,1) })
              })
              .catch(err=>console.log(err))
          })
          .catch(err=>console.log(err))
      }
     
    })
    .catch(err=>console.log(err))
})


module.exports = router;