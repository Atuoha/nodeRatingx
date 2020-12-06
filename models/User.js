const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const userSchema = new Schema({

    email:{type: String},

    fullname:{type: String},

    password:{type: String},

    role:{type: String,default: 'Subscriber'},

    company:{
       name:{type: String, default: ''},
       file: {type: String, default: ''}
    },
    passwordResetToken:{type: String, default: ''},
    passwordResetExpires: {type: Date, default: Date.now}
})    


module.exports = mongoose.model('users', userSchema);