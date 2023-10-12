const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

const Reviews = mongoose.model('reviews', {
  author: {
    type: ObjectId,
    ref: 'users',
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
  },
})
module.exports = Reviews
