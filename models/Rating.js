const mongoose = require('mongoose'),
    Schema = mongoose.Schema;


const ratingSchema = new Schema({

    company:{
        type: Schema.Types.ObjectId,
        ref: 'companies'
    },

    user:{
        type: Schema.Types.ObjectId,
        ref: 'users'
    },

    rating:{
        type: Number,
        default: 0
    },

    review:{
        type: String, 
        default: ''
    },
})    


module.exports = mongoose.model('ratings', ratingSchema)