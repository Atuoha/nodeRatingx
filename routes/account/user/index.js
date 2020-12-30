const express  = require('express'),
    app = express(),
    router = express.Router(),
    Company = require('../../../models/Company'),
    { userAuth } = require('../../../helpers/authenticate');
    
   





  router.all('/*', userAuth, (req, res, next)=>{
      req.app.locals.layout = 'user'
      next()
  })  

  router.get('/', (req, res)=>{
      Company.findOne({user: req.user.id})
      .then(company=>{
        let withACompany = req.user.company
         res.render('accounts/user/index', {title: 'nodeRatingx|User', company: company, withACompany: withACompany})
      })
  })





module.exports = router;