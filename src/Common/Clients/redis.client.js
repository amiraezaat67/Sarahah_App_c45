import  {createClient}  from 'redis'
import { redisConfig } from '../../config/index.js';

export const redisClient = createClient(redisConfig) 

export const redisConnection = async () => {
    try {
        await redisClient.connect()
        console.log('Redis connected successfully')
    } catch (error) {
        console.error('Redis connection failed', error)
    }
}