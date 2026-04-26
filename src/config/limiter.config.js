import { ipKeyGenerator } from "express-rate-limit";
import { getCountryCodeByIp, TooManyRequestsException } from "../Common/index.js";
import MongoStore from "rate-limit-mongo/lib/mongoStore.js";
import { envConfig } from "./env.config.js";


export const limiterOptions = {
    windowMs: 1 * 60 * 1000,
    max: async (req)=>{
        const ip = req.headers['x-forwarded-for']
        const countryCode = await getCountryCodeByIp(ip)
        switch (countryCode) {
            case 'IN':
                return 5
            default:
                return 3
        }
    },
    handler:(req,res,next)=>{
       throw new TooManyRequestsException(`Your reached the limit of requests, please try again later`)
    },
    legacyHeaders:false,
    skipFailedRequests: true,
    keyGenerator: (req) => {
        const  ip = ipKeyGenerator(req.headers['x-forwarded-for'])
        return `${ip}_${req.path}`
    },
    requestPropertyName:'rate_limiter_data',
    store: new MongoStore({
        uri: envConfig.database.MONGO_URL,
        collectionName: 'rate_limits',
        expireTimeMs: 1 * 60 * 1000
    })
}