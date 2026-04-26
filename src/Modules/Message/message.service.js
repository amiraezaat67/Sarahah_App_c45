import { MessageRepository } from "../../DB/Repositories/index.js";
import messageRepository from "../../DB/Repositories/message.repository.js";

export const  sendMessage = (body)=>{
    const {content, receiverId} = body;
    return messageRepository.createDocument({content, receiverId})
}

// list all messages
export const listMyMessages = (userId) =>{
    return MessageRepository.findDocuments({receiverId: userId})
}
