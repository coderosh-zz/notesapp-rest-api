import { Router } from 'express'

import emailExists from '../middlewares/emailExists'

import { check } from 'express-validator'
import { protectRoute } from '../middlewares/auth'
import {
  registerUser,
  loginUser,
  logoutAll,
  refreshToken,
  logout,
} from '../controllers/auth'

const router = Router()

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

router.route('/logoutall').get(protectRoute, logoutAll)

router.route('/token').post(refreshToken)

router.route('/logout').delete(logout)

export default router
