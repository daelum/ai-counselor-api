const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

const Reviews = mongoose.model('reviews', {
  author: {
    type: ObjectId,
    ref: 'users',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  content: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
  },
})
module.exports = Reviews
