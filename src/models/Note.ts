import { Schema, model, Document, Model } from 'mongoose'

interface IUser extends Document {
  title: string
  body: string
  keywords: string[]
  isPrivate: boolean
  likes: number
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
  },
  {
    timestamps: true,
  }
)

const NoteModel: Model<IUser> = model<IUser>('Note', NoteSchema)

export default NoteModel
