// Require Packages
const createError = require('http-errors')
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const mongoose = require('mongoose')
const cors = require('cors')
const { DB_URL } = require('./db')
const axios = require('axios')
const dotenv = require('dotenv')
const fs = require('fs')
//
const { Configuration, OpenAI } = require('openai')
require('dotenv').config()

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API,
})

// import models
const Users = require('./models/users')
const Reviews = require('./models/reviews')
const Chats = require('./models/chats')

// Build the App
const app = express()

// Middleware
app.use(logger('tiny'))
app.use(
  cors({
    credentials: true,
    origin: 'http://localhost:3000',
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cookieParser())

// Database
mongoose.connect(
  DB_URL,
  { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false },
  () => {
    console.log('Connected to MongoDB')
  }
)

// Security
require('./express-sessions')(app)

// Routes

app.get('/', async (req, res) => {
  console.log(req.query)
  console.log('Hello from the YOUR AI COUNSELOR API')
})

// LOGIN
app.post('/login', async (req, res) => {
  console.log(req.query)
  console.log('Hello from the LOGIN')
  try {
    console.log('hello')
    const user = await Users.findOne({
      email: req.body.email,
      password: req.body.password,
    })
    if (user) {
      req.login(user, (err) => {
        if (err) {
          throw err
        } else {
          res.send(user)
        }
      })
    } else {
      res.send('Invalid Email/Password!')
    }
    console.log(user)
    console.log('hello login')
  } catch (error) {
    throw error
  }
})

// LOGOUT
app.get('/logout', async (req, res) => {
  console.log(req.query)
  req.logout(function (err) {
    if (err) {
      return next(err)
    }
    req.session.destroy(function (err) {
      if (err) {
        return next(err)
      }
      res.clearCookie('connect.sid')
      res.send('Logged out')
    })
  })
  console.log('hello from logout yaya')
})

// SIGNUP
app.post('/signup', async (req, res) => {
  console.log(req.query)
  console.log('Hello from the SIGNUP')
  const userExists = await Users.findOne({
    email: req.body.email,
  })
  console.log(userExists)
  if (userExists) {
    res.send('User with this email already exists')
  } else {
    const user = await Users.create(req.body)
    req.login(user, (err) => {
      if (err) {
        throw err
      }
      console.log('user logged in')
    })
    res.send(user)
    console.log('hello im signup')
  }
})

// PROFILE
app.get('/profile', async (req, res) => {
  console.log(req.query)
  console.log('Hello from the PROFILE')
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).send('Please Login First')
    }
    // Find the user by ID
    const user = await Users.findById(req.user._id)
    // Access the user's counselors (if no counselors assign an epty arrat)
    const userCounselors = user.counselors || []
    // Respond with the user data and counselors
    res.status(200).json({ user, counselors: userCounselors })
  } catch (err) {
    console.error(err)
    res.status(500).send(err)
  }
})

// EDIT PROFILE
app.patch('/editprofile', async (req, res) => {
  console.log(req.query)
  console.log('Hello from the EDITPROFILE')
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).send('Please Login First')
    }
    const User = require('./models/users')
    // Update user's profile in the database
    await User.findByIdAndUpdate(req.user._id, req.body)
    const updatedUser = await User.findById(req.user._id)
    // Respond with the updated user
    res.status(200).send(updatedUser)
  } catch (err) {
    console.error(err)
    res.status(500).send(err)
  }
})

// CREATE or UPDATE COUNSELOR
app.post('/counselor', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).send('Please Login First')
    }
    // Find the user by ID
    const user = await Users.findById(req.user._id)
    // Update or create the counselor key
    user.counselors.push(req.body)
    await user.save()
    // Return the updated user
    res.status(200).json(user)
  } catch (err) {
    console.error(err)
    res.status(500).send(err)
  }
})

// COUNSELOR
app.post('/counselor/:counselorId', async (req, res) => {
  try {
    // Get the user ID who is sending the message
    const userId = req.user._id
    // Get the counselor ID from the route parameter
    const counselorId = req.params.counselorId
    // Get the messages from the request body
    const { message } = req.body
    // Create a chat document with sender information
    const chatDocument = {
      sender: userId,
      text: message,
    }
    // Save the chat document in the "chats" collection
    const chat = await Chats.create({
      counselorId,
      messages: [chatDocument],
    })
    // Find the user document by user ID
    const user = await Users.findById(userId)
    // Check if the user document exists
    if (user) {
      // Find the counselor object in the user's "counselor" array
      const counselorObject = user.counselors.find(
        (counselors) => counselors.counselorId === counselorId
      )
      // If the counselor object doesn't exist, create it
      if (!counselorObject) {
        user.counselor.push({
          counselorId,
          messages: [chatDocument],
        })
      } else {
        // If the counselor object exists, add the chat to their messages
        counselorObject.messages.push(chatDocument)
      }
      // Save the updated user document
      await user.save()
    }
    // Respond with a success message
    res.status(200).send('Message sent to counselor')
  } catch (err) {
    console.error(err)
    res.status(500).send(err)
  }
})

// COUNSELOR
// Load message history for a specific counselor
app.get('/counselor/:counselorId', async (req, res) => {
  try {
    // Get the user ID who wants to view the message history
    const userId = req.user._id
    // Get the counselor ID from the route parameter
    const counselorId = req.params.counselorId
    // Find the user document by user ID
    const user = await Users.findById(userId)
    // Check if the user document exists
    if (user) {
      // Find the counselor object in the user's "counselors" array
      const counselorObject = user.counselors.find(
        (counselor) => counselor.counselorId === counselorId
      )
      if (counselorObject) {
        // Retrieve the message history from the counselor object
        const messageHistory = counselorObject.messages
        res.status(200).send(messageHistory)
      } else {
        res.status(404).send('Counselor not found in user profile')
      }
    } else {
      res.status(404).send('User not found')
    }
  } catch (err) {
    console.error(err)
    res.status(500).send(err)
  }
})

//
//
// CHAT
// Exit the chat and save the chat history to the Chats collection
// app.post('/chat/:counselorId/exit', async (req, res) => {
//   try {
//     const response = await openai.listEngines()
//     // Get the user ID who is exiting the chat
//     const userId = req.user._id
//     // Get the counselor ID from the route parameter
//     const counselorId = req.params.counselorId
//     // Find the chat document in the "chats" collection
//     const chat = await Chats.findOne({ counselorId })
//     if (chat) {
//       // Get the messages from the chat and the chat history
//       const chatMessages = chat.messages
//       const chatHistory = chat.chatHistory || []
//       // Create an object to represent the chat history with userId, counselorId, and messages
//       const chatExitInfo = {
//         userId,
//         counselorId,
//         messages: chatMessages,
//       }
//       // Add the chat history to the chatHistory array
//       chatHistory.push(chatExitInfo)
//       // Update the chat document with the chat history
//       chat.chatHistory = chatHistory
//       chat.messages = [] // Clear the current chat messages
//       await chat.save()
//       // Respond with a success message
//       res.status(200).send('Chat history saved on exit')
//     } else {
//       res.status(404).send('Chat not found')
//     }
//   } catch (err) {
//     console.error(err)
//     res.status(500).send(err)
//   }
// })
//
//
//

// OPEN AI API
app.post('/test', async (req, res) => {
  // Find counselor accociated with the user
  const userCounselor = req.user.counselors.find((counselor) =>
    counselor._id.equals(req.body.counselorId)
  )

  // Validate counselor
  if (!userCounselor) {
    return res.status(400).send('Invalid parameter counselorId')
  }
  // Find or create a chat session based on the counselorId
  const chat = await Chats.findOne({ counselorId: req.body.counselorId })
  console.log({ chat })
  // Define the initial message from the AI
  const openAIRoleInitialMessage = {
    role: 'system',
    content:
      'Introduce yourself. Your name is Dave. You are a trained counselor.',
  }
  // Create an array of messages; if chat exists, use its messages, otherwise start with the initial AI message
  const messages = chat ? chat.messages : [openAIRoleInitialMessage]
  // Add the user's message to the array
  messages.push({
    role: 'user',
    content: req.body.content,
  })

  try {
    // Make a request to the OpenAI API for a chat completion
    const chatCompletion = await openai.chat.completions.create({
      messages: messages.map(({ role, content }) => ({ role, content })),
      model: 'gpt-3.5-turbo',
    })
    // Get the AI's response
    const aiAnswer = chatCompletion.choices[0].message
    // Add the AI's answer to the messages array
    messages.push(aiAnswer)

    if (chat) {
      // If the chat already exists, update its messages
      chat.messages = messages
      await chat.save()
    } else {
      // If the chat does not exist, create a new chat entry
      await Chats.create({
        counselorId: req.body.counselorId,
        messages,
      })
    }
    // Handle the AI response and send it back to the client
    res.status(200).send({ aiAnswer })
  } catch (err) {
    res.status(500).send(err)
  }
})

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404))
})

// Error Handler
app.use((err, req, res, next) => {
  // Respond with an error
  res.status(err.status || 500)
  res.send({
    message: err,
  })
})

app.listen(4000, () => {
  console.log('API up and running, send your requests! ^_^')
})

module.exports = app
