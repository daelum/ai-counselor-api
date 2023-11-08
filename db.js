require('dotenv').config()

module.exports = {
  DB_URL: `mongodb+srv://daelum:${process.env.DB_KEY}@cluster0.tnfj5io.mongodb.net/aicounselor`,
  SESSION_SECRET: 'YOUR_SECRET',
}
