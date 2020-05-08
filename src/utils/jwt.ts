import { sign, verify } from 'jsonwebtoken'

const jwtSecret = process.env.JWT_SECRET || 'secretkey'
const jwtExpires = process.env.JWT_EXPIRE || '1m'

console.log(jwtExpires)

const refreshSecret = process.env.REFRESH_SECRET || 'refreshkey'
const refreshExpires = process.env.REFRESH_EXPIRE || '30d'

const generateToken = (id: string) => {
  return sign({ id }, jwtSecret, {
    expiresIn: jwtExpires,
  })
}

const verifyToken = (token: string): any => {
  return verify(token, jwtSecret) as any
}

const generateRefreshToken = (id: string): any => {
  return sign({ id }, refreshSecret, {
    expiresIn: refreshExpires,
  })
}

const verifyRefreshToken = (token: string): any => {
  return verify(token, refreshSecret) as any
}

export { generateToken, verifyToken, generateRefreshToken, verifyRefreshToken }
