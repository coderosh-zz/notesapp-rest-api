import { Schema, Document, model, Model, HookNextFunction } from 'mongoose'
import { hash } from 'bcryptjs'

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
    validDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

UserSchema.pre('save', async function (this: IUser, next: HookNextFunction) {
  console.log(this.password)
  const hashedPassword = await hash(this.password, 10)
  this.password = hashedPassword

  console.log(hashedPassword)
})

const UserModel: Model<IUser> = model<IUser>('User', UserSchema)

export default UserModel
