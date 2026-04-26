
import jwt from 'jsonwebtoken'
import { envConfig } from '../../config/index.js';
import {UserRepository} from '../../DB/Repositories/index.js'
import { TOKEN_TYPES, USER_ROLES } from '../constants.js';
import { get } from '../Services/redis.service.js';
import { BadRequestException } from '../Utils/index.js';
const jwtSecrets = envConfig.jwt

// generate token
export const generateToken = ({payload , secret , options})=>{
    return jwt.sign(payload , secret , options)
}

// verify token
export const verifyToken = ({token  , secret , options})=>{
    return jwt.verify(token , secret , options)
}

// Create login credentials
export const createLoginCredentials = ({payload  , options , requiredToken})=>{
    
    const signatures = getSignatureByTypeAndRole({role:payload.role, both:true})

    let accessToken , refreshToken; 
    switch (requiredToken) {
        case TOKEN_TYPES.ACCESS:
            accessToken = generateToken(
                {
                payload,
                secret:signatures.accessSignature,
                options:options.access
                }
            )
            break;
        case TOKEN_TYPES.REFRESH:
            refreshToken = generateToken(
                {
                payload,
                secret:signatures.refreshSignature,
                options:options.refresh
                }
            )
            break;
        default:
            accessToken = generateToken(
                {
                payload,
                secret:signatures.accessSignature,
                options:options.access
                }
            )
            refreshToken = generateToken(
                {
                payload,
                secret:signatures.refreshSignature,
                options:options.refresh
                }
            )
            break;
    }

    return {accessToken, refreshToken}
}


/**
 * @param { String} token - token to be verfifed
 * @param { Enum } tokenType - referring to toke type if it access or refresh
 * @description decode token and verify it then return the existing user from main db
 * @returns {Object} user - user object
 * @returns {Object} decodedData - decoded data return from verified token
 */
export const decodeToken = async ({ token  , tokenType })=>{
    // decode token to get user role
    const data = jwt.decode(token)    
    if(!data.role) throw new Error('invalid payload' , {cause:{status:400}})
    
    const signature = getSignatureByTypeAndRole({role:data.role , tokenType})

    // verify token
    const decodedData = verifyToken({token , secret:signature})
    if(!decodedData._id) throw new Error('invalid payload' , {cause:{status:400}})

    // check if jti is blacklisted
    const isBlackListed = await get({key: `bl_${tokenType}_${decodedData.jti}`})
    if(isBlackListed)  throw new BadRequestException('Your session is ended . login again')
    
    const user = await UserRepository.findDocumentById(decodedData._id)
    return { user , decodedData}
}


export const detectSignatureByRole=({role})=>{
    let signatures ;
    if(role == USER_ROLES.ADMIN){
        signatures = jwtSecrets.admin
    }else{
        signatures = jwtSecrets.user
    }

    return signatures
}


export const getSignatureByTypeAndRole=({role, tokenType , both = false})=>{
    const signatures = detectSignatureByRole({role})

    if(both) return signatures

    let tokenSignature;
    switch(tokenType){
        case TOKEN_TYPES.ACCESS:
            tokenSignature = signatures.accessSignature
            break;
        case TOKEN_TYPES.REFRESH:
            tokenSignature = signatures.refreshSignature
            break;
        default:
            throw new Error('invalid token type' , {cause:{status:400}})
    }
    return tokenSignature
}
