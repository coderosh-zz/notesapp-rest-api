import { connect, ConnectionOptions } from 'mongoose'

const conOptions: ConnectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: true,
}

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/notes'

const connectDatabase = async () => {
  try {
    const connection = await connect(mongoUri, conOptions)

    console.log(`MongoDb Connected: ${connection.connection.host}`)
  } catch (e) {
    console.log(e)
  }
}

export default connectDatabase
