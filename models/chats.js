const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

const Chats = mongoose.model('chats', {
  counselorId: ObjectId,
  messages: [
    {
      role: String,
      content: String,
      // userid: String,
      // histroy: String,
      // counselorid: String,
      // history: String,
    },
  ],
})
module.exports = Chats
