class CustomError extends Error {
  constructor(message: string | undefined, public statusCode: number) {
    super(message)
  }
}

export default CustomError
