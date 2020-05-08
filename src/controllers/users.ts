import { NextFunction, Request, Response } from 'express'
import { validationResult } from 'express-validator'

import User from '../models/User'
import CustomError from '../models/CustomError'

const getAllUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find({})

    res.json({ success: true, users })
  } catch (e) {
    next(new CustomError('Something went wrong', 500))
  }
}

const getSingleUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.params.id).select('-password')

    if (!user) {
      return next(
        new CustomError(`No user with the id of ${req.params.id} found`, 404)
      )
    }

    res.json({ success: true, user })
  } catch (e) {
    next(new CustomError("Something went wrong, couldn't find user", 500))
  }
}

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

    await user.save()

    res.status(201).json({ success: true, user })
  } catch (e) {
    next(new CustomError("Something went wrong, couldn't register user", 500))
  }
}

const removeUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return next(
        new CustomError(`No user with the id of ${req.params.id} found`, 404)
      )
    }

    await User.findByIdAndDelete(req.params.id)

    res.json({ success: true, user: [] })
  } catch (e) {
    next(new CustomError("Something went wrong, couldn't remove user", 500))
  }
}

const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return next(
        new CustomError(`No user with the id of ${req.params.id} found`, 404)
      )
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })

    res.json({ success: true, user: updatedUser })
  } catch (e) {
    next(new CustomError("Something went wrong, couldn't update user", 500))
  }
}

export { getAllUser, getSingleUser, registerUser, removeUser, updateUser }
