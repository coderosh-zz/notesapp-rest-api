import redis from 'redis'
import { promisify } from 'util'

const redisRefreshKey: string = process.env.REDIS_REFRESH_KEY || 'notes_refresh'

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379'
const client = redis.createClient(redisUrl)
const getAsync = promisify(client.get).bind(client)

const getRedis = async () => {
  const validRefresh = await getAsync(redisRefreshKey)

  if (validRefresh) {
    return JSON.parse(validRefresh)
  }

  client.set(redisRefreshKey, JSON.stringify([]))
  return []
}

const pushRedis = async (token: string) => {
  const refreshTokens = await getRedis()
  refreshTokens.push(token)
  client.set(redisRefreshKey, JSON.stringify(refreshTokens))
}

const filterRedis = async (token: string) => {
  const rTokens = await getRedis()
  const frTokens = rTokens.filter((key: string) => key != token)
  client.set(redisRefreshKey, JSON.stringify(frTokens))
}

export { pushRedis, filterRedis, getRedis }
