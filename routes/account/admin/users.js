const express = require('express'),
    app = express(),
    router = express.Router(),
    User = require('../../../models/User'),
    Company = require('../../../models/Company'),
    faker = require('faker'),
    fs = require('fs'),
    bcrypt = require('bcryptjs'),
    { isEmpty } = require('../../../helpers/upload-helpers'),
    { adminAuth } = require('../../../helpers/authenticate');
    
   





router.all('/*', (req, res, next)=>{
    req.app.locals.layout = 'admin';
    next()
})    



router.get('/', (req, res)=>{
        User.find()
        .populate('company')
        .then(users=>{
            res.render('accounts/admin/users', {title: 'Admin|Users', users: users})
        })
        .catch(err=>console.log(err))
       
})



router.get('/edit/:id', (req, res)=>{
    User.findOne({_id: req.params.id})
    .populate('company')
    .then(employee=>{
        res.render('accounts/admin/users/edit', {title: 'Edit|Employee', employee: employee})
    })
    .catch(err=>console.log(err))
})


router.get('/show/:id', (req, res)=>{
    User.findOne({_id: req.params.id})
    .populate('company')
    .then(employee=>{
        res.render('accounts/admin/users/show', {title: employee.fullname, employee: employee})
    })
    .catch(err=>console.log(err))
})


router.get('/create/:id', (req, res)=>{
    Company.findOne({_id: req.params.id})
    .then(company=>{
        res.render('accounts/admin/users/create', {title: 'Create|Employee', company: company})
  
    })
    .catch(err=>console.log(err))
})



router.get('/create', (req, res)=>{
        Company.find()
        .then(companies=>{
            res.render('accounts/admin/users/create', {title: 'Create|Employee', companies:companies})
        })
        .catch(err=>console.log(err))    
})


router.post('/create', (req, res)=>{
    User.findOne({email: req.body.email})
    .then(user=>{
        if(user){
            req.flash('error_msg', 'Email already exists. Try again!')
            res.redirect('/admin/users/create')
        }else{
            let filename = ''
            if(!isEmpty(req.files)){
                let file = req.files.file
                filename = Date.now()+'-'+file.name
                let uploadDir = './public/uploads/'
                file.mv(uploadDir+filename, err=>{
                    if(err)console.log(err)
                })
            }

           
            const newUser = new User()
            newUser.fullname = req.body.fullname
            newUser.email  = req.body.email
            newUser.position = req.body.position
            newUser.status = req.body.status
            newUser.role = req.body.role
            newUser.company = req.body.company
            newUser.file = filename


            bcrypt.genSalt(10, (err, salt)=>{
                bcrypt.hash(req.body.password, salt, (err, hash)=>{
                    if(err)console.log(err)
                    newUser.password = hash
                    newUser.save()
                    .then(response=>{

                          // pushing created user as an employee of a company
                            Company.findOne({user: req.user})
                            .then(company=>{
                                company.employees.push(newUser)
                                company.save()
                                .then(done=>{
                                    console.log('Employeed pushed')
                                })
                                .catch(err=>console.log(err))
                            })
                            .catch(err=>console.log(err))

                            // giving an employee managerial priviledges
                            if(req.body.role == 'Manager'){
                                Company.findOne({user: req.user})
                                .then(company_created=>{
                                    company_created.user.push(newUser)
                                    company_created.save()
                                    .then(done=>{
                                        console.log('Manager pushed')
                                    })
                                    .catch(err=>console.log(err))
                                })
                                .catch(err=>console.log(err))
                            }


                        req.flash('success_msg', 'Employee record saved successfully :)')
                        res.redirect('/admin/users')
                    })
                    .catch(err=>console.log(err))
                })
            })
        }
    })
})





router.get('/dummy', (req, res)=>{
    res.render('accounts/admin/users/dummy', {title: 'Admin|Users'})
})



router.post('/dummy', (req, res)=>{
    for(let i = 0; i < req.body.number; i++){

        const newUser = new User()
        newUser.fullname = faker.lorem.word() . faker.lorem.word()
        newUser.email = faker.internet.email()
        newUser.phone = '000-000-000-000'
        
        bcrypt.genSalt(10, (err, salt)=>{
            bcrypt.hash('secret', salt, (err, hash)=>{
                if(err)console.log(err)
                newUser.password = hash
                newUser.save()
                .then(response=>{
                    req.flash('success_msg', `${req.body.number} dummy users has been created :)`)
                    res.redirect('/admin/users')
                })
                .catch(err=>console.log(err))
            })
        })
    }
})



router.put('/update/:id', (req, res)=>{
    User.findOne({_id: req.params.id})
    .then(employee=>{
        let filename = employee.file
        if(!isEmpty(req.files)){
            let file = req.files.file
            filename = Date.now()+'-'+file.name
            let uploadDir = './public/uploads/'
            file.mv(uploadDir+filename, err=>{
                if(err)console.log(err)
            })

            if(employee.file != '' && employee.file != 'default.png'){
                let delDir = './public/uploads/'
                fs.unlink(delDir+employee.file, err=>{
                    if(err)console.log(err)
                })
            }
        }


        if(req.body.password){
           employee.fullname = req.body.fullname
            employee.email  = req.body.email
            employee.position = req.body.position
            employee.status = req.body.status
            employee.role = req.body.role
            employee.file = filename

            bcrypt.genSalt(10, (errj, salt)=>{
                bcrypt.hash(req.body.password, salt, (err, hash)=>{
                    employee.password = hash
                    employee.save()
                    .then(response=>{
                        req.flash('success_msg', `${response.fullname} has been updated successfully`)
                        res.redirect('/admin/users');
                    })
                    .catch(err=>console.log(err))
                })
            })
        }else{
            employee.fullname = req.body.fullname
            employee.email  = req.body.email
            employee.position = req.body.position
            employee.status = req.body.status
            employee.role = req.body.role
            employee.file = filename
            employee.save()
            .then(response=>{
                req.flash('success_msg', `${response.fullname} has been updated successfully`)
                res.redirect('/admin/users');
            })
            .catch(err=>console.log(err))
        }
    })
})



router.delete('/delete/:id', (req, res)=>{
    User.findOne({_id: req.params.id})
    .then(employee=>{

        if(employee.file != '' && employee.file != 'default.png'){
            let delDir = './public/uploads/'
            fs.unlink(delDir+employee.file, err=>{
                if(err)console.log(err)
            })
        }

        employee.delete()
        .then(response=>{
            req.flash('success_msg', `${response.fullname} has been deleted successfully`)
            res.redirect('/admin/users');
        })
        .catch(err=>console.log(err))
    })
})





module.exports = router;    