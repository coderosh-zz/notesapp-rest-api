import { Router } from 'express'
import { check } from 'express-validator'
import objectId from '../middlewares/objectId'

import {
  getAllNotes,
  getSingleNote,
  createNote,
  updateNote,
  deleteNote,
} from '../controllers/notes'

const router = Router()
const checkObjectId = objectId('note')

router
  .route('/')
  .get(getAllNotes)
  .post(
    [
      check('title').trim().notEmpty().withMessage('Please provide title'),
      check('body').trim().notEmpty().withMessage('Please provide body'),
      check('isPrivate').toBoolean(),
    ],
    createNote
  )

router
  .route('/:id')
  .get(checkObjectId, getSingleNote)
  .patch(
    [
      check('title')
        .trim()
        .optional()
        .notEmpty()
        .withMessage("Title can't be empty"),
      check('body')
        .trim()
        .optional()
        .notEmpty()
        .withMessage("Body can't be empty"),
    ],
    checkObjectId,
    updateNote
  )
  .delete(checkObjectId, deleteNote)

export default router
