import { Request, Response, NextFunction } from 'express'
import { Types } from 'mongoose'
import CustomError from '../models/CustomError'

export default (name: string) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!Types.ObjectId.isValid(req.params.id)) {
      throw new CustomError(
        `No ${name} with the id of ${req.params.id} found`,
        404
      )
    }
    next()
  }
}
