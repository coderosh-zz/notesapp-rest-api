import CustomError from '../models/CustomError'
import { NextFunction, Request, Response } from 'express'
import { validationResult } from 'express-validator'
import {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt'

import User from '../models/User'
import { compare } from 'bcryptjs'

let validRefreshTokens: string[] = []

const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).send({ success: false, errors: errors.array() })
    }

    const { name, email, password } = req.body
    const user = await User.create({ name, email, password })

    const token = generateToken(user.id)
    const refreshToken = generateRefreshToken(user.id)
    validRefreshTokens.push(refreshToken)

    res.status(201).json({ success: true, token, refresh: refreshToken })
  } catch (e) {
    next(new CustomError("Something went wrong, couldn't register user", 500))
  }
}

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).send({ success: false, errors: errors.array() })
    }

    const { email, password } = req.body
    const user = await User.findOne({ email })

    if (!user) {
      return next(new CustomError('Invalid Credentials', 401))
    }

    const match = await compare(password, user.password)
    if (!match) {
      return next(new CustomError('Invalid Credentials', 401))
    }

    const token = generateToken(user.id)
    const refreshToken = generateRefreshToken(user.id)
    validRefreshTokens.push(refreshToken)

    res.json({ success: true, token, refresh: refreshToken })
  } catch (e) {
    next(new CustomError("Something went wrong, couldn't login user", 500))
  }
}

const logoutAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const uid = req.uid
    const user = await User.findById(uid)
    const date = new Date().getTime() - 1000
    if (!user) {
      return next(new CustomError('Something went wrong', 500))
    }
    await user.update({ validDate: new Date(date) })

    const token = generateToken(req.uid)

    res.json({ success: true, token })
  } catch (e) {
    next(new CustomError('Something went wrong', 500))
  }
}

const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const rToken = req.body.token

    if (!rToken) {
      return next(new CustomError('Please provide refresh token', 400))
    }

    let decoded
    try {
      decoded = verifyRefreshToken(rToken)
    } catch (e) {
      return next(new CustomError('Refresh token not valid', 401))
    }

    const user = await User.findById(decoded.id)

    if (!user) {
      return next(new CustomError('Refresh token not valid', 401))
    }

    const validDate = new Date(user.validDate)
    const iatDate = new Date(parseInt(decoded.iat) * 1000)

    if (validDate.getTime() > iatDate.getTime()) {
      return next(new CustomError('Refresh token not valid', 401))
    }

    if (!validRefreshTokens.includes(rToken)) {
      return next(new CustomError('Refresh token not valid', 401))
    }

    const newToken = generateToken(decoded.id)

    res.json({ success: true, token: newToken })
  } catch (e) {
    next(new CustomError('Something went wrong', 500))
  }
}

const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rToken = req.body.token

    if (!rToken) {
      return next(new CustomError('Please provide refresh token', 400))
    }

    validRefreshTokens = validRefreshTokens.filter(rt => rt != rToken)

    res.json({ success: true })
  } catch (e) {
    throw new CustomError('Server Error', 500)
  }
}

export { registerUser, loginUser, logout, logoutAll, refreshToken }
