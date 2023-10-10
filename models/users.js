const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

const Users = mongoose.model('users', {
    email: {
        type: String, 
        required: true
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    }
})

module.exports = Users