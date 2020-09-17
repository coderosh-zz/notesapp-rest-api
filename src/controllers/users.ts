import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { hash } from "bcryptjs";

import User from "../models/User";
import CustomError from "../models/CustomError";

import Note from "../models/Note";

const getAllUser = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find({}).select("-password");

    res.json({ success: true, users });
  } catch (e) {
    next(new CustomError("Something went wrong", 500));
  }
};

const getSingleUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return next(
        new CustomError(`No user with the id of ${req.params.id} found`, 404)
      );
    }

    res.json({ success: true, user });
  } catch (e) {
    next(new CustomError("Something went wrong, couldn't find user", 500));
  }
};

const removeUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.uid);
    if (!user) {
      return next(
        new CustomError(`No user with the id of ${req.uid} found`, 404)
      );
    }

    await User.findByIdAndDelete(req.uid);

    const notes = user.notes;

    for (const noteId of notes) {
      await Note.findByIdAndDelete(noteId);
    }

    res.json({ success: true, user: [] });
  } catch (e) {
    next(new CustomError("Something went wrong, couldn't remove user", 500));
  }
};

const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ success: false, errors: errors.array() });
    }

    const user = await User.findById(req.uid);
    if (!user) {
      return next(
        new CustomError(`No user with the id of ${req.uid} found`, 404)
      );
    }

    if (req.body.password) {
      const oneSecAgo = new Date().getTime() - 1000;
      req.body.validDate = new Date(oneSecAgo);
      req.body.password = await hash(req.body.password, 10);
    }

    let updatedUser = await User.findByIdAndUpdate(req.uid, req.body, {
      new: true,
    }).select("-password");

    res.json({ success: true, user: updatedUser });
  } catch (e) {
    next(new CustomError("Something went wrong, couldn't update user", 500));
  }
};

const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const uid = req.uid;
    const user = await User.findById(uid).select("-password");

    res.json({ success: true, user });
  } catch (e) {
    next(new CustomError("Something went wrong, couldn't login user", 500));
  }
};

const notesByUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const uid = req.uid;

    const notes = await User.findById(uid).select("notes").populate("notes");

    if (!notes) {
      return next(new CustomError("User notes not found", 404));
    }

    res.json({ success: true, notes: notes.notes, _id: notes.id });
  } catch (e) {
    next(
      new CustomError("Something went wrong, couldn't find user's notes", 500)
    );
  }
};

const getSingleNoteByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const uid = req.uid;
    const noteId = req.params.id;

    const note = await Note.findById(noteId);

    if (!note) {
      return next(new CustomError(`Note not found`, 404));
    }

    if (note.creator != uid) {
      return next(new CustomError(`Note not found`, 404));
    }

    res.json({ success: true, note });
  } catch (e) {
    next(
      new CustomError("Something went wrong, couldn't find user's notes", 500)
    );
  }
};

export {
  getAllUser,
  getSingleUser,
  removeUser,
  updateUser,
  me,
  notesByUser,
  getSingleNoteByUser,
};
