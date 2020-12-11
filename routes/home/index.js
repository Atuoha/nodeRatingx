const express  = require('express'),
    app = express(),
    router = express.Router();


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





module.exports = router;