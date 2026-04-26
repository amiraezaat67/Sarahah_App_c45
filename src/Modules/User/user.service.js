import mongoose from "mongoose";
import { BadRequestException } from "../../Common/index.js";
import { MessageRepository, UserRepository } from "../../DB/Repositories/index.js";

export const getProfileService = (req)=>{
    return req.user
}

export const updateUserProfile = async (user , body)=>{
    const { _id } = user
    const { firstName , lastName , age , gender , email} = body    

    if(email){
        const existingUser = await UserRepository.findOneDocument({email});
        if(existingUser){
            throw new Error('Email already exists' , {cause: {status:409}});
        }
    }

    return UserRepository.updateWithFindById({
        id: _id, 
        data: { firstName , lastName , age , gender , email }, 
        options:{new:true}
    });
}

export const getAllUsers = async ()=>{
    return UserRepository.findDocuments({})
}

export const uploadProfilePicture = async ( user , file )=>{
    if(!file ||  !file.path) throw new BadRequestException('File is required');

    return UserRepository.updateWithFindById({
        id: user._id,
        data: { profilePicture: file.path },
        options:{ new:true}
    });
}



export const deleteUserAccount = async (user ) => {
    const { _id } = user
    const session = await mongoose.startSession()
    return session.withTransaction( async ()=>{
        await MessageRepository.deleteManyDocuments({filters:{receiverId:_id} , options:{session}})
        await UserRepository.deleteWithFindById({_id , options:{session}})
    })
}

/**
 * Remote hosting
 * 
 * code wise 
 * 
 * Database wise
 * 
 * Github
 */