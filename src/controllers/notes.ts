import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'

import Note from '../models/Note'
import CustomError from '../models/CustomError'
import User from '../models/User'

interface pagination {
  next?: {
    page: number
    limit: number
  }
  prev?: {
    page: number
    limit: number
  }
}

const getAllNotes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const queryParams = { ...req.query }
    const exclude = ['select', 'isPrivate', 'sort', 'limit', 'page']
    exclude.forEach(p => delete queryParams[p])

    let notesQuery = Note.find({ ...queryParams, isPrivate: false })

    if (req.query.select) {
      const requiredFields = req.query.select.toString().split(',').join(' ')
      notesQuery = notesQuery.select(requiredFields)
    }

    if (req.query.sort) {
      const sortBy = req.query.sort.toString().split(',').join(' ')
      notesQuery = notesQuery.sort(sortBy)
    } else {
      notesQuery = notesQuery.sort('-createAt')
    }

    let page: number
    let limit: number

    if (req.query.page) {
      page = parseInt(req.query.page.toString(), 10)
    } else {
      page = 1
    }

    if (req.query.limit) {
      limit = parseInt(req.query.limit.toString(), 10)
    } else {
      limit = 10
    }

    const total = await Note.count({ isPrivate: false })

    const start: number = (page - 1) * limit
    const end: number = page * limit

    notesQuery = notesQuery.skip(start).limit(limit)

    const notes = await notesQuery

    const pagination: pagination = {}
    console.log(total)
    if (end < total) {
      pagination.next = {
        page: page + 1,
        limit,
      }
    }

    if (start > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      }
    }

    res.send({ success: true, pagination, notes })
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
    const note = await Note.findOne({ _id: req.params.id, isPrivate: false })

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

    if (note.creator != req.uid) {
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

    if (note.creator != req.uid) {
      return next(
        new CustomError(`You don't have permission to delete this note`, 401)
      )
    }

    await Note.findByIdAndDelete(req.params.id)

    const user = await User.findById(req.uid)

    if (user) {
      let notes = user.notes.filter(noteId => noteId != req.params.id)
      await user.update({ notes })
    }

    res.send({ success: true, note: [] })
  } catch (e) {
    console.log(e)
    next(new CustomError("Something went wrong, couldn't delete note", 500))
  }
}

export { getAllNotes, getSingleNote, createNote, updateNote, deleteNote }
