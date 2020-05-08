import User from '../models/User'
import { Request, Response, NextFunction } from 'express'
import CustomError from '../models/CustomError'

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.body.email) {
      const user = await User.findOne({ email: req.body.email })

      if (user) {
        return next(new CustomError('Email already exists', 400))
      }
    }

    next()
  } catch (e) {
    next(new CustomError('Something went wrong, please try again', 500))
  }
}
