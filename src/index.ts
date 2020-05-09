import express from 'express'
import morgan from 'morgan'
import mongoSanitize from 'express-mongo-sanitize'
import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import hpp from 'hpp'

import connectDatabase from './config/db'
import errorMiddleware from './middlewares/error'
import notes from './routes/notes'
import users from './routes/users'
import auth from './routes/auth'

const app = express()
app.use(express.json())

// Logger
app.use(morgan('dev'))

// Sanitize
app.use(mongoSanitize())

// Security headers
app.use(helmet())

// Cors
app.use(cors())

// Prevent hpp
app.use(hpp())

// Rate limit
app.use(
  rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  })
)

// Routes
app.use('/api/v1/notes', notes)
app.use('/api/v1/users', users)
app.use('/api/v1/auth', auth)

// Error Handling Middleware
app.use(errorMiddleware)

const PORT = process.env.PORT || 3000
connectDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`)
  })
})
