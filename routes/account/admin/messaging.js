const express = require('express'),
    app = express(),
    router = express.Router(),
    User = require('../../../models/User'),
    Messaging = require('../../../models/Messaging');


router.all('/*', (req, res, next)=>{
    req.app.locals.layout = 'messaging';
    next()
})   


router.get('/', (req, res)=>{
    res.redirect('/user')
})

router.get('/:id', (req, res)=>{
    User.findOne({_id: req.params.id})
    .then(user=>{
        // Messaging.find({'$or': [{'receiver': req.params.id, 'sender': req.user.id}, {'receiver': req.user.id, 'sender': req.params.id}]})
        // .populate('sender')  
        // .populate('receiver')    
        // .then(chats=>{
        //     res.render('accounts/user/messaging', {title: 'Messaging', user: user, chats: chats})
        // })
        // .catch(err=>console.log(err))
        Messaging.find({'sender': req.user})
        .populate('sender')
        .populate('receiver')
        .then(logged_chats=>{
            Messaging.find({'sender': req.params.id})
            .populate('sender')
            .populate('receiver')
            .then(receiver_chats=>{
             res.render('accounts/user/messaging', {title: 'Messaging', user: user, logged_chats: logged_chats, receiver_chats: receiver_chats})
            })
            .catch(err=>console.log(err)) 
        })
        .catch(err=>console.log(err))

    })
    .catch(err=>console.log(err))
})


router.post('/create', (req, res)=>{
    const newMsg = new Messaging()
    newMsg.sender = req.body.sender;
    newMsg.receiver = req.body.receiver;
    newMsg.msg = req.body.msg;
    newMsg.save()
    .then(response=>{
        res.redirect('back');
    })
    .catch(err=>console.log(err))

})

module.exports = router;    