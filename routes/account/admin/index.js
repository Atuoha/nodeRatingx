const express  = require('express'),
    app = express(),
    router = express.Router(),
    Rating = require('../../../models/Rating'),
    User = require('../../../models/User'),
    Company = require('../../../models/Company'),
    { adminAuth } = require('../../../helpers/authenticate');
    
   





  router.all('/*', adminAuth, (req, res, next)=>{
      req.app.locals.layout = 'admin'
      next()
  })  

  router.get('/', (req, res)=>{
      Rating.countDocuments()
      .then(ratingCount=>{
          User.countDocuments()
          .then(usersCount=>{
            User.find({role: 'Manager'})
            .then(managers=>{
              let keys =  Object.keys(managers);
              let managerCount = keys.length
              Company.countDocuments()
              .then(companyCount=>{
                  res.render('accounts/admin/index', {title: 'nodeRatingx|Admin', usersCount: usersCount, companyCount: companyCount, ratingCount: ratingCount, managerCount: managerCount})
              })
              .catch(err=>console.log(err))
            })
            .catch(err=>console.log(err))
          })
          .catch(err=>console.log(err))
        })
        .catch(err=>console.log(err))
      
       
      
   
  })





module.exports = router;