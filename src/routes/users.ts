import { Router } from 'express'
import { check } from 'express-validator'

import {
  getAllUser,
  getSingleUser,
  registerUser,
  removeUser,
  updateUser,
  loginUser,
  me,
} from '../controllers/users'

import emailExists from '../middlewares/emailExists'
import objectId from '../middlewares/objectId'
import { protectRoute } from '../middlewares/auth'

const router = Router()
const checkObjectId = objectId('user')

router
  .route('/register')
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
  .route('/login')
  .post(
    [
      check('email').notEmpty().withMessage('Please provide email'),
      check('password').notEmpty().withMessage('Please provide password'),
    ],
    loginUser
  )

router.route('/').get(getAllUser)

router.route('/me').get(protectRoute, me)

router
  .route('/:id')
  .get(checkObjectId, getSingleUser)
  .delete(protectRoute, checkObjectId, removeUser)
  .patch(
    protectRoute,
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
