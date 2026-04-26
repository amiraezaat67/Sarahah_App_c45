import { envConfig } from "./index.js";
const emails = envConfig.emails

export const emailConfig = {
    service: emails.service,
    auth:{
        user: emails.user,
        pass: emails.pass
    }
}