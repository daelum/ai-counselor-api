const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

const Users = mongoose.model('users', {
  email: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  postcode: {
    type: Number,
  },
  country: {
    type: String,
  },
  state: {
    type: String,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
  },
  sexuality: {
    type: String,
  },
  counselors: [
    {
      name: String,
      topic: String,
      interests: String,
      religion: String,
      book: String,
      goals: String,
    },
  ],
})

module.exports = Users
