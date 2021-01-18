if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}


const express = require('express'),
    app = express(), 
    mongoose = require('mongoose'),
    flash = require('connect-flash'),
    session = require('express-session'),
    upload = require('express-fileupload'),
    bodyParser = require('body-parser'),
    handlebars = require('express-handlebars'),
    Handlebars = require('handlebars'),
    port  = process.env.PORT || 1777,
    path = require('path'),
    moment = require('moment'),
    passport = require('passport'),
    {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access'),
    methodOverride = require('method-override'),
    {mongodbURI} = require('./config/db');



mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;
mongoose.set('useCreateIndex', true);


mongoose.connect(mongodbURI, {useNewUrlParser: true, useUnifiedTopology: true })
    .then(db=> console.log('Connected'))
    .catch(err=> console.log(err))

app.use(express.static(path.join(__dirname, 'public'))) // Loading Static files like css, js and stuffs


// custom select handlebars function
const {select, generate_date, ifeq, paginate} = require('./helpers/handlebars-helpers')

// 

// --SETTING view engine using handlebars
app.engine('handlebars', handlebars(
    {
        defaultLayout: 'home',
        helpers:{select: select, generate_date: generate_date, ifeq: ifeq, paginate: paginate},
        partialsDir: path.join(__dirname, "views/layouts/partials"),
        handlebars: allowInsecurePrototypeAccess(Handlebars)
    
    }
    
))


// upload middleware
app.use(upload())

// setting view engine
app.set('view engine', 'handlebars')
// 

// Setting up bodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
// 


// express-validator middleware
// app.use(validator())

// Session Middleware
app.use(session({
    secret: 'tonyAtuoha',
    resave: true,
    saveUninitialized: true
}));

// Flash Middleware
app.use(flash());


// override with POST having ?_method=DELETE
app.use(methodOverride('_method'))


//Passport inits
app.use(passport.initialize());
app.use(passport.session());



// sETTing local variable for flash msgs
app.use( (req, res, next)=>{
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.loggedUser = req.user || null
    next();
})

app.locals.moment = moment;





// ROUTES
// home
const home = require('./routes/home/index')
app.use('/', home);

// logins
const logs = require('./routes/logins/index')
app.use('/logs', logs);






// ADMINISTARATION BOARD
// admin
const admin = require('./routes/account/admin/index')
app.use('/admin', admin);


// COMPANY
const admin_company = require('./routes/account/admin/company')
app.use('/admin/company', admin_company);


// PROFILE
const admin_profile = require('./routes/account/admin/profile')
app.use('/admin/profile', admin_profile);


// USERS
const admin_users = require('./routes/account/admin/users')
app.use('/admin/users', admin_users);



// RATING/REVIEW
const admin_rating = require('./routes/account/admin/rating')
app.use('/admin/company/rating', admin_rating);


// MESSAGING
const admin_messaging = require('./routes/account/admin/messaging')
app.use('/admin/messaging', admin_messaging);













// USER BOARD
// user
const user = require('./routes/account/user/index')
app.use('/user', user);



// COMPANY
const company = require('./routes/account/user/company')
app.use('/user/company', company);


// PROFILE
const profile = require('./routes/account/user/profile')
app.use('/user/profile', profile);


// EMPLOYEE
const employee = require('./routes/account/user/employee')
app.use('/user/employee', employee);


// RATING/REVIEW
const rating = require('./routes/account/user/rating')
app.use('/user/company/rating', rating);


// MESSAGING
const messaging = require('./routes/account/user/messaging')
app.use('/user/messaging', messaging);






app.listen(port, ()=>{
    console.log(`Running on port ${port}`)
})    




    