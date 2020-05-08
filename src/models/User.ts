import { Schema, Document, model, Model } from 'mongoose'

interface IUser extends Document {
  name: string
  email: string
  password: string
  passwordLastUpdated: Date
}

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    passwordLastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

const UserModel: Model<IUser> = model<IUser>('User', UserSchema)

export default UserModel
