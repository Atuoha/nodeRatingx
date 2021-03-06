const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const userSchema = new Schema({

    email:{type: String},

    fullname:{type: String},

    password:{type: String},

    facebookID:{type: String},

    tokens: Array,

    status:{type: String, default: 'Active'},

    phone:{type: String, default: ''},

    file:{type: String},

    role:{type: String, default: 'Subscriber'},

    position:{type: String, default: 'Employee'},

    company:{
        type: Schema.Types.ObjectId,
        ref: 'companies'
    },
    passwordResetToken:{type: String, default: ''},
    passwordResetExpires: {type: Date, default: Date.now}
})    


module.exports = mongoose.model('users', userSchema);