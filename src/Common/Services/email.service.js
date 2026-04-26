import { envConfig } from "../../config/index.js";
import { transporter } from "../Clients/index.js";
import { EventEmitter } from "node:events";

const fromEmail =  envConfig.emails.user

export const  sendEmail = async (
    {
        to,
        subject,
        html,
        attachments
    }
)=>{
    try {
        const info = await transporter.sendMail({
            from: `"Sarahah App" <${fromEmail}>`,
            to,
            subject,    
            html,
            attachments: attachments || []
        });

    console.log("Message sent: %s", info.messageId);
    } catch (err) {
     console.error("Error while sending mail:", err);
    }
}


export const emailEvents = new EventEmitter()
emailEvents.on('sendEmail', ({to , subject ,html})=>{
    sendEmail({to , subject , html})
})