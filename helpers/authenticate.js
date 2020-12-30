module.exports = {

    userAuth: function(req, res, next){
        if(req.isAuthenticated()){

            return next()
        }

        res.redirect('/logs/signin')
    },


    adminAuth: function(req, res, next){
        if(req.isAuthenticated()){

            if(req.user.role != 'Admin'){
                res.redirect('/user')
            }
            return next()
        }

        res.redirect('/logs/signin')
    },
}