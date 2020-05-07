import express from 'express'
import morgan from 'morgan'

import connectDatabase from './config/db'

const app = express()

// Logger
app.use(morgan('dev'))

app.get('/', (req, res, next) => {
  res.send({ msg: "It's working" })
})

const PORT = process.env.PORT || 3000

connectDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Listening on http://localhost:${PORT}`)
    })
  })
  .catch((e: Error) => {
    console.log(e.message)
  })
