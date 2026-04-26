import Joi from "joi";
import { isValidObjectId } from "mongoose";

// id : 69d5856cfbf1129795c2cb88
const ObjectId = (value , helper)=>{
    return isValidObjectId(value) ? value : helper.message(`Invalid ObjectId`)
}


export const generalValidators  = {
    _id: Joi.custom(ObjectId),
     email: Joi
            .string()
            .email({ tlds: { allow: ['com', 'org'] } , multiple:true , separator:'$'}) 
            .messages({
                'string.email': 'Email must be a valid email address example: example@gmail.com , example@gmail.org'
            }),
    password: Joi
            .string()
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
            .messages({
                'string.pattern.base':'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character from [@$!%*?&]',
                'any.required':'Password cannot be empty'
            })
}
