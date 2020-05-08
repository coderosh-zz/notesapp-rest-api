import { NextFunction, Request, Response } from 'express'
import { validationResult } from 'express-validator'
import { compare, hash } from 'bcryptjs'

import User from '../models/User'
import CustomError from '../models/CustomError'
import { generateToken } from '../utils/jwt'
import Note from '../models/Note'

const getAllUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find({}).select('-password')

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

    const token = generateToken(user.id)

    res.status(201).json({ success: true, token })
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

    if (user.id != req.uid) {
      return next(
        new CustomError(`You aren't authorized to acces this route`, 401)
      )
    }

    await User.findByIdAndDelete(req.params.id)

    const notes = user.notes

    for (const noteId of notes) {
      await Note.findByIdAndDelete(noteId)
    }

    res.json({ success: true, user: [] })
  } catch (e) {
    next(new CustomError("Something went wrong, couldn't remove user", 500))
  }
}

const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).send({ success: false, errors: errors.array() })
    }

    const user = await User.findById(req.params.id)
    if (!user) {
      return next(
        new CustomError(`No user with the id of ${req.params.id} found`, 404)
      )
    }

    if (req.body.password) {
      req.body.validDate = new Date()
      req.body.password = await hash(req.body.password, 10)
    }

    let updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })

    res.json({ success: true, user: updatedUser })
  } catch (e) {
    next(new CustomError("Something went wrong, couldn't update user", 500))
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

    res.json({ success: true, token })
  } catch (e) {
    next(new CustomError("Something went wrong, couldn't login user", 500))
  }
}

const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const uid = req.uid
    const user = await User.findById(uid).select('-password')

    res.json({ success: true, user })
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

export {
  getAllUser,
  getSingleUser,
  registerUser,
  removeUser,
  updateUser,
  loginUser,
  me,
  logoutAll,
}
