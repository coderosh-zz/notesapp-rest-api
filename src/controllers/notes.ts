import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import mongoose from 'mongoose'

import Note from '../models/Note'
import CustomError from '../models/CustomError'
import User from '../models/User'

const getAllNotes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notes = await Note.find({})

    res.send({ success: true, notes })
  } catch (e) {
    next(new CustomError('Something went wrong', 500))
  }
}

const getSingleNote = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const note = await Note.findOne({ _id: req.params.id })

    if (!note) {
      return next(
        new CustomError(`No note with the id of ${req.params.id} found`, 404)
      )
    }

    res.send({ success: true, note })
  } catch (e) {
    next(new CustomError("Something went wrong, couldn't find note", 500))
  }
}

const createNote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).send({ success: false, errors: errors.array() })
    }

    const { title, body, keywords, isPrivate } = req.body

    const note = await Note.create({
      title,
      body,
      keywords,
      isPrivate,
      creator: req.uid,
    })

    const user = await User.findById(req.uid)

    if (user) {
      const notes = [...user.notes, note.id]
      await user.update({ notes })
    }

    res.status(201).send({ success: true, note })
  } catch (e) {
    next(new CustomError("Something went wrong, couldn't create note", 500))
  }
}

const updateNote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).send({ success: false, errors: errors.array() })
    }

    const note = await Note.findById(req.params.id)

    if (!note) {
      return next(
        new CustomError(`No note with the id of ${req.params.id} found`, 404)
      )
    }

    if (note.creator !== req.uid) {
      return next(
        new CustomError(`You don't have permission to edit this note`, 401)
      )
    }

    let updatedNote = await Note.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })

    res.send({ success: true, note: updatedNote })
  } catch (e) {
    next(new CustomError("Something went wrong, couldn't update note", 500))
  }
}

const deleteNote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const note = await Note.findById(req.params.id)

    if (!note) {
      return next(
        new CustomError(`No note with the id of ${req.params.id} found`, 404)
      )
    }

    if (note.creator !== req.uid) {
      return next(
        new CustomError(`You don't have permission to delete this note`, 401)
      )
    }

    await Note.findByIdAndDelete(req.params.id)

    const user = await User.findById(req.uid)

    if (user) {
      let notes = user.notes.filter(noteId => noteId !== req.params.id)
      user.notes = notes
      await user.update({ notes })
    }

    res.send({ success: true, note: [] })
  } catch (e) {
    next(new CustomError("Something went wrong, couldn't delete note", 500))
  }
}

export { getAllNotes, getSingleNote, createNote, updateNote, deleteNote }
