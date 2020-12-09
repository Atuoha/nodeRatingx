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



// sETTing local variable for flash msgs
app.use( (req, res, next)=>{
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.loggedUser = req.user || null

    next();
})


//Passport inits
app.use(passport.initialize());
app.use(passport.session());


// ROUTES
// home
const home = require('./routes/home/index')
app.use('/', home);

// logins
const logs = require('./routes/logins/index')
app.use('/logs', logs);




app.listen(port, ()=>{
    console.log(`Running on port ${port}`)
})    




    