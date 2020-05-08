import { NextFunction, Request, Response } from 'express'
import CustomError from '../models/CustomError'
import { verifyToken } from '../utils/jwt'
import User from '../models/User'
const protectRoute = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return next(
        new CustomError('You are not authorize to access this route', 401)
      )
    }

    const decoded = verifyToken(token)

    const user = await User.findById(decoded.id)

    if (!user) {
      return next(
        new CustomError('You are not authorize to access this route', 401)
      )
    }

    const validDate = new Date(user.validDate)
    const iatDate = new Date(parseInt(decoded.iat) * 1000)

    if (validDate.getTime() > iatDate.getTime()) {
      return next(
        new CustomError('You are not authorize to access this route', 401)
      )
    }

    req.uid = decoded.id
    next()
  } catch (e) {
    next(new CustomError('Something went wrong', 500))
  }
}

export { protectRoute }
