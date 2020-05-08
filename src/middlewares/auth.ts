import { NextFunction, Request, Response } from 'express'
import CustomError from '../models/CustomError'
import { verifyToken } from '../utils/jwt'
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

    req.uid = decoded.id
    next()
  } catch (e) {
    next(new CustomError('Somethin went wrong', 500))
  }
}

export { protectRoute }
