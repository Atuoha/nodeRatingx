const { Timestamp } = require('mongodb')
const mongoose =  require('mongoose')
    Schema = mongoose.Schema

const msgSchema = new Schema({
    sender:{
        type: Schema.Types.ObjectId,
        ref: 'users'
    },

    receiver:{
        type: Schema.Types.ObjectId,
        ref: 'users'
    },

    msg:{
        type: String
    },

    createdAt:{
        type: Date,
        default: Date.now
    }
})    



module.exports = mongoose.model( 'messagings', msgSchema);