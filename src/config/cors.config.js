

import { envConfig } from "./index.js"
const whiteListedOrigins  = envConfig.cors.whiteListedOrigins

export const corsOptions = {
    origin: (origin, callback) => {
        if (whiteListedOrigins.includes(origin) || !origin) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}