import { Router } from 'express'
import { check } from 'express-validator'

import {
  getAllNotes,
  getSingleNote,
  createNote,
  updateNote,
  deleteNote,
} from '../controllers/notes'

const router = Router()

router
  .route('/')
  .get(getAllNotes)
  .post(
    [
      check('title').notEmpty().withMessage('Please provide title'),
      check('body').notEmpty().withMessage('Please provide body'),
      check('isPrivate').toBoolean(),
    ],
    createNote
  )

router.route('/:id').get(getSingleNote).patch(updateNote).delete(deleteNote)

export default router
