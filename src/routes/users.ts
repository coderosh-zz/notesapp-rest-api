import { Router } from "express";
import { check } from "express-validator";

import {
  getAllUser,
  getSingleUser,
  removeUser,
  updateUser,
  me,
  notesByUser,
} from "../controllers/users";

import emailExists from "../middlewares/emailExists";
import objectId from "../middlewares/objectId";
import { protectRoute } from "../middlewares/auth";

const router = Router();
const checkObjectId = objectId("user");

router.route("/").get(getAllUser);

router.route("/notes").get(protectRoute, notesByUser);

router
  .route("/me")
  .get(protectRoute, me)
  .delete(protectRoute, checkObjectId, removeUser)
  .patch(
    protectRoute,
    checkObjectId,
    emailExists,
    [
      check("name")
        .trim()
        .optional()
        .notEmpty()
        .withMessage("Name can't be empty"),
      check("email")
        .trim()
        .optional()
        .notEmpty()
        .withMessage("Email can't be empty")
        .isEmail()
        .withMessage("Please provide valid email")
        .normalizeEmail(),
      check("password")
        .trim()
        .optional()
        .notEmpty()
        .withMessage("Password can't be empty")
        .isLength({ min: 6 })
        .withMessage("Password should have more than 5 characters"),
    ],
    updateUser
  );

router.get("/:id", checkObjectId, getSingleUser);

export default router;
