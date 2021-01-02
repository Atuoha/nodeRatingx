
const express = require('express'),
    app = express(),
    router = express.Router(),
    Company = require('../../../models/Company'),
    User = require('../../../models/User'),
    Rating = require('../../../models/Rating'),
    faker = require('faker'),
    fs = require('fs'),
    { isEmpty } = require('../../../helpers/upload-helpers'),
    { adminAuth } = require('../../../helpers/authenticate');
    
   





router.all('/*', (req, res, next)=>{
    req.app.locals.layout = 'admin'
    next()
})    



router.get('/', (req, res)=>{
    // Company.find({user: req.user})'
    Company.find()
    .then(companies=>{
        res.render('accounts/admin/company', {title: 'Admin|Company', companies: companies})
    })
    .catch(err=>console.log(err))
})





router.get('/subscribers_view', (req, res)=>{
    // Company.find({user: req.user})'
    Company.find()
    .then(companies=>{
        res.render('accounts/admin/company/subscribers_company_views', {title: 'Companies|nodeRatings', companies: companies})
    })
    .catch(err=>console.log(err))
})



router.get('/leaderboard', (req, res)=>{
    Company.find()
    .sort({'ratingSum': -1})
    .then(companies=>{
        res.render('accounts/admin/company/leaderboard', {title: 'Leaderboard|nodeRatings', companies: companies})
    })
    .catch(err=>console.log(err))
})


router.get('/create', (req, res)=>{
    res.render('accounts/admin/company/create', {title: 'Company|Create'});
})


router.get('/dummy', (req, res)=>{
   
    res.render('accounts/admin/company/dummy', {title: 'company|Dummy'})
})


router.get('/edit/:id', (req, res)=>{
        
    Company.findOne({_id: req.params.id})
    .then(company=>{
         res.render('accounts/admin/company/edit', {title: 'Company|Edit', company: company})
    })
    .catch(err=>console.log(err))

})

router.get('/show/:id', (req, res)=>{
    Company.findOne({_id: req.params.id})
    .populate('user')
    .then(company=>{
        Rating.find({company: req.params.id})
        .populate('user')
        .populate('company')
        .then(ratings=>{
            let keys =  Object.keys(ratings);
            let ratingCount = keys.length
            let averageRating  = company.ratingSum/company.ratingNumber
            res.render('accounts/admin/company/show', {title: `${company.name}`, company: company, ratings: ratings, ratingCount: ratingCount, averageRating: parseFloat(averageRating,1) })
        })
        .catch(err=>console.log(err))
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
           res.render('accounts/admin/company/subscribers_company_views', {title: 'Searched|nodeRatings', companies: companies})
        }else{
          //  found a single company
            Company.findOne({'$or': [{'name': regex}]})
            .populate('user')
            .then(company=>{
  
              if(!company){
                req.flash('error_msg', 'No company with such name')
                res.redirect('/search')
              }

                // Obtaining the ratings 
                Rating.find({company: company._id})
                .populate('company')
                .populate('user')
                .then(ratings=>{
                    let keys =  Object.keys(ratings);
                    let ratingCount = keys.length
                    let averageRating  = company.ratingSum/company.ratingNumber
                    res.render('account/admin/company/show', {title: `${company.name}`, company: company, ratings: ratings, ratingCount: ratingCount, averageRating: parseFloat(averageRating,1) })
                })
                .catch(err=>console.log(err))
            })
            .catch(err=>console.log(err))
        }
       
      })
      .catch(err=>console.log(err))
  })





router.post('/create', (req, res)=>{

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
    newCompany.user.push(req.user)
    newCompany.save()
    .then(response=>{

        // adding company to logged in user's profile
        User.findOne({_id: req.user})
        .then(user=>{
            user.company = newCompany
            user.save()
            .then(response=>{
                req.flash('success_msg', 'Company registered successfully')
                res.redirect('/admin/company')
            })
            .catch(err=>console.log(err))
        })
        .catch(err=>console.log(err))
        
    })
    .catch(err=>console.log(err))

   
})




router.post('/dummy', (req, res)=>{

    for(let i = 0; i < req.body.number; i++){
        const newCompany = new Company()
        newCompany.name = faker.lorem.word()+ ' ' + faker.random.word()
        newCompany.address = faker.random.word()+' Avenue'
        newCompany.sector = faker.random.word()
        newCompany.website = 'www.'+faker.random.word()+'.com'
        newCompany.country = 'Country'
        newCompany.city = 'City'
        newCompany.file = 'img_place.png'
        newCompany.user.push(req.user)
        newCompany.save()
        .then(response=>{
            req.flash('success_msg', `${req.body.number} dummy companies created :)`)
            res.redirect('/admin/company')
        })
        .catch(err=>console.log(err))

    }
})


router.put('/update/:id', (req, res)=>{
   

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
            res.redirect('/admin/company')
        })
        .catch(err=>console.log(err))

    })
    .catch(err=>console.log(err))
})



router.delete('/delete/:id', (req, res)=>{

    Company.findOne({_id: req.params.id})
    .then(company=>{
        
    
        if(company.file !== 'img_place.png' && company.file !== ''){
            let delDir = './public/uploads/'
            fs.unlink(delDir+company.file, err=>{
                if(err)console.log(err)
            })
        }

        // removing company from users data
        User.find({company: company.id})
        .then(user=>{
            user.company = ''
            user.save()
            .then(response=>{
                console.log(`Removed all users that had ${company.name} ):`)
            })
            .catch(err=>console.log(err))
        })

        company.delete()
        .then(response=>{
            req.flash('success_msg', `${response.name} has been deleted :)`)
        })
        .catch(err=>console.log(err))

    })
    .catch(err=>console.log(err))
})

module.exports = router;
