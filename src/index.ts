import express from 'express'
import morgan from 'morgan'

import connectDatabase from './config/db'
import errorMiddleware from './middlewares/error'
import notes from './routes/notes'
import users from './routes/users'

const app = express()

app.use(express.json())

// Logger
app.use(morgan('dev'))

// Routes
app.use('/api/v1/notes', notes)
app.use('/api/v1/users', users)

// Error Handling Middleware
app.use(errorMiddleware)

const PORT = process.env.PORT || 3000
connectDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`)
  })
})
