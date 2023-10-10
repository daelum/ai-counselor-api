// Require Packages
const createError = require('http-errors')
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const mongoose = require('mongoose')
const cors = require('cors')
const { DB_URL } = require('./db')

// import models
const Users = require('./models/users')
const Reviews = require('./models/reviews')

// Build the App
const app = express()

// Middleware
app.use(logger('tiny'))
app.use(
  cors({
    credentials: true,
    origin: 'http://localhost:3000'
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
  console.log(req.query);
  console.log('Hello from the YOUR AI COUNSELOR API');
})

// LOGIN
app.post('/login', async (req, res) => {
  console.log(req.query);
  console.log('Hello from the LOGIN');
  try {
      console.log('hello');
    const user = await Users.findOne({
      email: req.body.email,
      password: req.body.password
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
    console.log(user);
    console.log('hello login');
    } catch (error) {
      throw error
    }
})

// SIGNUP
app.post('/signup', async (req, res) => {
  console.log(req.query);
  console.log('Hello from the SIGNUP');
  const userExists = await Users.findOne({
    email: req.body.email
  })
  console.log(userExists);
  if (userExists) {
    res.send('User with this email already exists') 
  } else {
  const user = await Users.create(req.body)
  req.login(user, (err) => {
    if (err) { throw err}
    console.log('user logged in')
  })
  res.send(user)
  console.log('hello im signup');
  }
})

app.get('/profile', async (req, res) => {
  console.log(req.query);
  console.log('Hello from the PROFILE');
})

app.patch('/editprofile', async (req, res) => {
  console.log(req.query);
  console.log('Hello from the EDITPROFILE');
})

app.post('/create', async (req, res) => {
  console.log(req.query);
  console.log('Hello from the CREATOR');
})

app.get('/chat', async (req, res) => {
  console.log(req.query);
  console.log('Hello from the get CHAT');
})




// app.get('/houses', async (req, res) => {
//   try {
//     const myQuery = {}
//     if (req.query.rooms) {
//       myQuery.rooms = {$gte:req.query.rooms}
//     }
//     if (req.query.price) {
//       myQuery.price = {$lte:req.query.price}
//     }
//     if (req.query.location) {
//       myQuery.location = req.query.location
//     }
//     if (req.query.title) {
//       myQuery.title = req.query.title
//     }
//     const allHouses = await Houses.find(myQuery).sort('-price')
//     res.send(allHouses)
//   } catch(err) {
//     res.status(500).send(err)
//   }
//   console.log('Hello from Houses');
// })

// app.get('/houses/:id', async (req, res) => {
   
//   try {
//     // Check if the user is authenticated
//     // if (!req.isAuthenticated()) {
//     //   return res.status(401).send('Please Login First');
//     // }
//     // User is authenticated, proceed with retrieving the house data

//     const house = await Houses.findById(req.params.id).populate({
//       path: 'host',
//       select: 'name',
//     });
//     console.log(req.params.id);
//     console.log(house);
//     // Check if the house exists
//     if (!house) {
//       return res.status(404).send('House not found');
//     }
//     // Return the house data
//     res.send(house);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send(err);
//   }
// });

// //HOUSES POST

// app.post('/houses', async (req, res) => {
//   try {
//     // Check if the user is authenticated
//     if (!req.isAuthenticated()) {
//       return res.status(401).send('Please Login First');
//     }
//     // if authenticated, proceed with creating the house
//     req.body.host = req.user._id;
//     console.log(req.body);

//     const house = await Houses.create(req.body);
//       res.status(201).send(house);
//     console.log('Hello from post houses');
//   } catch (err) {
//     console.error(err);
//     res.status(500).send(err);
//   }
// });

// //UPDATE COUNCELLOR
// app.patch('/counselor/:id', async (req, res) => {
//   try {
//     if (req.isAuthenticated()) {
//       let counselor = await User.counselor.findByIdAndUpdate(req.params.id)
//       if (req.user._id.equals(house.host)) {
//         let updatedCounselor = await User.counselor.findById(req.params.id, req.body)
//           res.send(updatedCounselor)
//       } else {
//         res.send('Not Authorized')
//       }
//     } else {
//       res.status(401).send('Please Login First')
//     }
//   } catch (err) {
//     res.send(err)
//   }
// })

// // DELETE COUNSELOR
// app.delete('/counselor/:id', async (req, res) => {
//     try {
//     let counselor = await User.counselor.findByIdAndDelete(req.params.id)
//     if (req.isAuthenticated()) {
//         let deleteCounselor = await User.findById(req.params.id, req.body)
//           res.send(deleteCounselor)
//       }
//     } catch (err) {
//     res.send(err)
//   }
// })

// // app.get('/bookings', async (req, res) => {
// //   try {
// //     const booking = await Bookings.find({
// //       author: req.user._id, 
// //       house: req.query._id,
// //     }).sort('house')
// //     res.status(200).send(booking)
// //   } catch(err) {
// //     res.status(500).send(err)
// //   }
// //   console.log('Hello from Booking');
// // })


// // app.post('/bookings', async (req, res) => {
// //     try {
// //       if (req.isAuthenticated()) {
// //         req.body.author = req.user._id
// //         console.log(req.body);
// //         const booking = await Bookings.create(req.body)
// //         res.status(201).send(booking) 
// //         console.log('Hello im booking')
// //       } else {
// //         console.log("User is not logged in")
// //         res.status(401).send('User not Logged in')
// //       }
// //   }
// //   catch(err) {
// //     res.status(500).send(err)
// //   }
// // })


// app.get('/reviews', async (req, res) => {
//     try {
//     // Check if the 'house' query parameter is provided in the request
//     if (!req.query.house) {
//       return res.status(400).send('House ID is required');
//     }
//     // Retrieve all reviews with house _id
//     const review = await Reviews.find({ house: req.query.house });

//     // Return the reviews as a response
//     res.send(review);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send(err);
//   }
// });

// app.post('/reviews', async (req, res) => {
//     try {
//     // Check if the user is authenticated
//     if (!req.isAuthenticated()) {
//       return res.status(401).send('Please Login First');
//     }
//     // Assuming you have a `Review` model defined
//     const Reviews = require('./models/reviews');

//     // Create a new review using the request body
//     const createdReview = await Reviews.create({
//       author: req.user._id,
//       description: req.body.description,
//       house: req.body.house, 
//       rating: req.body.rating,
//     })
//     // Return the created review as a response
//     res.status(201).send(createdReview);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send(err);
//   }
// })


// app.get('/profile', async (req, res) => {
//     try {
//     // Check if the user is authenticated
//     if (!req.isAuthenticated()) {
//       return res.status(401).send('Please Login First');
//     }
//     // if authenticated, access the user information
//     const loggedInUser = req.user;
//     // Respond with the user data
//     res.status(200).send(loggedInUser);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send(err);
//   }
// });

// app.patch('/profile', async (req, res) => {
//   try {
//     // Check if the user is authenticated
//     if (!req.isAuthenticated()) {
//       return res.status(401).send('Please Login First');
//     }
//     const User = require('./models/users'); 
//     // Update user's profile in the database
//     await User.findByIdAndUpdate(
//       req.user._id, 
//       req.body,
//     );
//     const updatedUser = await User.findById(req.user._id);
//     // Respond with the updated user
//     res.status(200).send(updatedUser);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send(err);
//   }
// });

// //LOGIN
// app.post('/login', async (req, res) => {
//   try {
//     console.log('hello');
//   const user = await Users.findOne({
//     email: req.body.email,
//     password: req.body.password
//   })
//   if (user) {
//     req.login(user, (err) => {
//       if (err) { 
//         throw err
//       } else {
//         res.send(user)
//       }
//     })
//   } else {
//     res.send('Invalid Email/Password!')
//   }
//   console.log(user);
//   console.log('hello login');
//   } catch (error) {
//     throw error
//   }
// })

// //SIGNUP
// app.post('/signup', async (req, res) => {
//   console.log('hello');
//   const userExists = await Users.findOne({
//     email: req.body.email
//   })
//   console.log(userExists);
//   if (userExists) {
//     res.send('User with this email already exists') 
//   } else {
//   const user = await Users.create(req.body)
//   req.login(user, (err) => {
//     if (err) { throw err}
//     console.log('user logged in')
//   })
//   res.send(user)
//   console.log('hello im signup');
//   }
// })

// //LOGOUT
// app.get('/logout', async (req, res) => {
//   console.log(req.query);
//   req.logout(function(err) {
//     if (err) { return next(err) }
//       req.session.destroy(function (err) {
//         if (err) { return next(err) }
//         res.clearCookie('connect.sid')
//         res.send('Logged out')
//     })
//   })
//   console.log('hello from logout yaya');
// })

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404))
})

// Error Handler
app.use((err, req, res, next) => {
  // Respond with an error
  res.status(err.status || 500)
  res.send({
    message: err
  })
})

module.exports = app
