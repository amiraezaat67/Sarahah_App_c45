import { decodeToken, TOKEN_TYPES } from "../Common/index.js";


export const authenticate = async (req,res,next)=>{

    const { authorization }= req.headers
    if(!authorization){
        throw new Error('Authorization header is required', { cause :{ status:400}})
    }

    const [prefix, token] = authorization.split(' ')

    switch (prefix) {
        case 'Basic':
            const [username, password] = Buffer.from(token, 'base64').toString('utf-8').split(':')
            break;
        case 'Bearer':
            const {user , decodedData } = await decodeToken({token, tokenType:TOKEN_TYPES.ACCESS})
            if(!user){
                throw new Error('Invalid user credentials , please register', { cause :{ status:404 }})
            }
            req.user = user 
            req.accessTokenData = decodedData
            break;
        default:
            break;
    }

    next()
}


export const authorize = (roles)=>{
    return (req,res,next)=>{
        const userRole = req.user.role
        if(!roles?.includes(userRole)){
            throw new Error('You are not authorized to access this route', { cause :{ status: 403 }})
        }
        next()
    }
}
