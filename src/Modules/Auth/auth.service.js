import { OAuth2Client } from 'google-auth-library';
import crypto from 'node:crypto'
import { BadRequestException, CHANNELS, compare, ConflictException, createLoginCredentials, decodeToken, encrypt, hash, NotFoundException, PROVIDERS, TOKEN_TYPES } from "../../Common/index.js";
import { envConfig } from "../../config/index.js";
import  UserRepository  from "../../DB/Repositories/user.repository.js";
import { blackListToken } from '../../Common/Services/redis.service.js';
import { emailEvents } from '../../Common/Services/email.service.js';
import { otpTemplate } from '../../Common/Utils/template.js';

const jwtSecrets  = envConfig.jwt
const gcp = envConfig.gcp
const client = new OAuth2Client();


export const registerService = async (body) => {    
    const { firstName, lastName, email, password , gender , phone } = body;

    // Repo pattern
    const checkEmailDuplication = await UserRepository.findOneDocument({email},{email:1});    
    if (checkEmailDuplication) {
        throw new ConflictException("Email already exists", {duplicatedEmail: email});
    }

    const hashedPassword = await hash(password , 12)
    const userObject = {
        firstName,
        lastName,
        email,
        password:hashedPassword,
        gender
    };

    if(phone) {
        userObject.phoneNumber = encrypt(phone);
    }

    const otp = Math.floor(100000 + Math.random() * 900000);    
    userObject.OTPs = [{value:otp , expireAt: Date.now() + 5 * 60 * 1000 , channel:CHANNELS.EMAIL}]

    // send Welcome email
    emailEvents.emit('sendEmail', {
        to:email,
        subject:'Verification code',
        html: otpTemplate({otp, expiration:5}),
    })

    return UserRepository.createDocument(userObject);

}

export const verifyEmailService = async ( body) =>{
    const { email , otp } = body

    const user = await UserRepository.findOneDocument({email});
    if(!user) {
        throw new NotFoundException("User not found");
    }

    const otpObject = user.OTPs.find(({value}) => value == otp);
    if(!otpObject) {
        throw new NotFoundException("OTP not found");
    }

    // check expiration
    if(otpObject.expireAt < Date.now()) {
        throw new BadRequestException("OTP expired");
    }

    const newOtpsArray = user.OTPs.filter(({value}) => value != otp);
    return UserRepository.updateWithFindById({
        id: user._id ,
        data: {isEmailVerified:true , OTPs: newOtpsArray}, 
        options:{new:true}
    })
}

export const loginService = async (body) => {
    const { email, password } = body;
    
    const user  = await UserRepository.findOneDocument({email, provider:PROVIDERS.SYSTEM});
    if (!user) {
        throw new Error("Invalid email or password", {cause:{status:401}});
    }
    
    const isPasswordValid = await compare(password , user.password)
    if (!isPasswordValid) {
        throw new Error("Invalid email or password", {cause:{status:401}});
    }
    
    // Generate user token  [ access token ]
   return buildTokens(user)
}

export const refreshTokenService = async (header)=>{
    // get refresh token from headers
    const { authorization:refreshToken } = header

    const {decodedData} = await decodeToken({token:refreshToken , tokenType:TOKEN_TYPES.REFRESH})    

    const { accessToken } = createLoginCredentials(
        {
            payload:{ _id:decodedData._id , role:decodedData.role , email:decodedData.email }, // payload
            options:{  
                access:{
                    expiresIn: jwtSecrets[decodedData.role].accessExpiration,
                    jwtid:crypto.randomUUID()
                }
            },
            requiredToken:TOKEN_TYPES.ACCESS
        }
    )

    return { accessToken}
}

const buildTokens = (userData)=>{
    // Generate user token  [ access token ]
    let tokenPayload = { _id : userData._id , email : userData.email , role:userData.role}
    const { accessToken , refreshToken } = createLoginCredentials(
        {
            payload:tokenPayload,
            options:{  
                access:{
                    expiresIn:jwtSecrets[userData.role].accessExpiration,
                    jwtid:crypto.randomUUID()
                },
                refresh:{
                    expiresIn:jwtSecrets[userData.role].refreshExpiration,
                    jwtid:crypto.randomUUID()
                }
            }
        }
    )
    return { accessToken , refreshToken };
}

const verifyIdToken = async (token)=>{
    const ticket = await client.verifyIdToken({
        idToken:token,
        audience: gcp.webClientId
    });
    const payload = ticket.getPayload();
    return payload;
}

const handleUserUpdateOrCreation = async ({user, payload})=>{
    const { given_name, family_name, email , sub } = payload
    if(user){
      return UserRepository.updateWithFindById({
        id: user._id,
        data:{ firstName:given_name , lastName:family_name, email },
        options:{new:true}
      })
    }else{
        const hashedPassword = await hash(crypto.randomBytes(12).toString('hex'))
        return  UserRepository.createDocument({
            firstName:given_name ,
            lastName:family_name,
            email:email,
            provider:PROVIDERS.GOOGLE,
            googleSub:sub,
            password:hashedPassword
        })
    }
}

export const gmailRegisterService =  async (body) =>{
    const { idToken }= body

    // 1. verify id token
    const payload = await verifyIdToken(idToken)
    if(!payload || !payload.email_verified){
        throw new Error("Your account is not authorized, please contact google service", {cause:{status:401}})
    }

    // 2. fetch user data from database
    const user = await UserRepository.findOneDocument({
        $or:[
            {googleSub:payload.sub},
            {email:payload.email}
        ],
        provider:PROVIDERS.GOOGLE
    })

    // 3. Upadate or create user 
    const userData = await handleUserUpdateOrCreation({user , payload})

    // 4. genereta user tokens
    return buildTokens(userData)

}

export const gmailLoginService = async (body) =>{
    const { idToken }= body

    // 1. verify id token
    const payload = await verifyIdToken(idToken)
    if(!payload || !payload.email_verified){
        throw new Error("Your account is not authorized, please contact google service", {cause:{status:401}})
    }

    // 2. fetch user data from database
    const user = await UserRepository.findOneDocument({
        $or:[
            { googleSub:payload.sub },
            { email:payload.email }
        ],
        provider:PROVIDERS.GOOGLE
    })
    if(!user) throw new Error("User not found", {cause:{status:404}})

    // 3. genereta user tokens
    return buildTokens(user)
}

export const logoutService = async( accessTokenData , refreshToken)=>{

    const {decodedData:refreshTokenData} = await decodeToken({token: refreshToken , tokenType:TOKEN_TYPES.REFRESH})

    const { exp: refreshExpiration , jti:refreshTokenId} = refreshTokenData
    const { exp: accessExpiration , jti: accessTokenId} = accessTokenData

    Promise.all([
        blackListToken({key:`bl_${TOKEN_TYPES.REFRESH}_${refreshTokenId}` , exp: refreshExpiration}) ,
        blackListToken({key:`bl_${TOKEN_TYPES.ACCESS}_${accessTokenId}` , exp: accessExpiration})
    ])

    return { message: 'Logged out successfully' }
}