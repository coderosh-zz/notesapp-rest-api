import { Schema, model, Document, Model, Types } from 'mongoose'

interface IUser extends Document {
  title: string
  body: string
  keywords: string[]
  isPrivate: boolean
  likes: number
  creator: string
}

const NoteSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
    },
    keywords: {
      type: [String],
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    likes: {
      type: Number,
      default: 0,
    },
    creator: {
      type: Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
)

const NoteModel: Model<IUser> = model<IUser>('Note', NoteSchema)

export default NoteModel
