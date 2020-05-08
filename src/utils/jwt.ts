import { sign, verify, SignOptions } from 'jsonwebtoken'

const jwtSecret = process.env.JWT_SECRET || 'secretkey'
const jwtExpires = process.env.JWT_EXPIRE || '1d'

const generateToken = (id: string) => {
  return sign({ id }, jwtSecret, {
    expiresIn: jwtExpires,
  })
}

const verifyToken = (token: string): any => {
  return verify(token, jwtSecret) as any
}

export { generateToken, verifyToken }
