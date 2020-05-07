import { Request, Response, NextFunction } from 'express'
import CustomError from '../models/CustomError'

const errorMiddleware = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { statusCode, message } = err

  res.status(statusCode || 500).json({
    success: false,
    errors: [
      {
        msg: message,
      },
    ],
  })
}

export default errorMiddleware
