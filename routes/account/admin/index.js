const express  = require('express'),
    app = express(),
    router = express.Router();


  router.all('/*', (req, res, next)=>{
      req.app.locals.layout = 'admin'
      next()
  })  

  router.get('/', (req, res)=>{
          res.render('admin/index', {title: 'nodeRatingx|Admin'})
  })





module.exports = router;