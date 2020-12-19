const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const companySchema = new Schema({
    name:{
        type: String
    },

    address:{
        type: String
    },

    sector:{
        type: String
    },

    website:{
        type: String
    },

    file:{
        type: String
    },

    city:{
        type: String
    },

    country:{
        type: String
    },

    user:[{
        type: Schema.Types.ObjectId,
        ref: 'users'
    }],

    employees:[{
       type: Schema.Types.ObjectId,
       ref: 'users'
    }],

    ratingNumber: {type: Number, default: 0},
    ratingSum:{type: Number, default: 0},




})    


module.exports = mongoose.model('companies', companySchema)