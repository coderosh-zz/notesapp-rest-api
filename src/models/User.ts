import {
  Schema,
  Document,
  model,
  Model,
  HookNextFunction,
  Types,
} from 'mongoose'
import { hash } from 'bcryptjs'

interface IUser extends Document {
  name: string
  email: string
  password: string
  validDate: Date
  notes: any[]
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
    validDate: {
      type: Date,
      default: Date.now,
    },
    notes: [
      {
        type: Types.ObjectId,
        ref: 'Note',
      },
    ],
  },
  {
    timestamps: true,
  }
)

UserSchema.pre('save', async function (this: IUser, next: HookNextFunction) {
  const hashedPassword = await hash(this.password, 10)
  this.password = hashedPassword
})

const UserModel: Model<IUser> = model<IUser>('User', UserSchema)

export default UserModel
