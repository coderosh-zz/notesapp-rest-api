import { Router } from 'express'
import { check } from 'express-validator'

import {
  getAllUser,
  getSingleUser,
  registerUser,
  removeUser,
  updateUser,
} from '../controllers/users'

import emailExists from '../middlewares/emailExists'
import objectId from '../middlewares/objectId'

const router = Router()
const checkObjectId = objectId('user')

router
  .route('/')
  .get(getAllUser)
  .post(
    [
      check('name').trim().notEmpty().withMessage('Please provide name'),
      check('email')
        .trim()
        .notEmpty()
        .withMessage('Please provide email')
        .isEmail()
        .withMessage('Please provide valid email')
        .normalizeEmail(),
      check('password')
        .trim()
        .notEmpty()
        .withMessage('Please provide password')
        .isLength({ min: 6 })
        .withMessage('Password should have more than 5 characters'),
    ],
    emailExists,
    registerUser
  )

router
  .route('/:id')
  .get(checkObjectId, getSingleUser)
  .delete(checkObjectId, removeUser)
  .patch(
    checkObjectId,
    emailExists,
    [
      check('name')
        .trim()
        .optional()
        .notEmpty()
        .withMessage("Name can't be empty"),
      check('email')
        .trim()
        .optional()
        .notEmpty()
        .withMessage("Email can't be empty")
        .isEmail()
        .withMessage('Please provide valid email')
        .normalizeEmail(),
      check('password')
        .trim()
        .optional()
        .notEmpty()
        .withMessage("Password can't be empty")
        .isLength({ min: 6 })
        .withMessage('Password should have more than 5 characters'),
    ],
    updateUser
  )

export default router
