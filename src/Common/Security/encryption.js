import crypto from "node:crypto";
import { envConfig } from "../../config/index.js";
const encryptionEnv = envConfig.encryption;


const encryptionKey = Buffer.from(encryptionEnv.ENCRYPTION_KEY, 'hex')

//====================================== Symmetirc Encryption ======================================
export const encrypt = (plainText)=>{

    // generate iv based on IV_LENGTH
    const iv = crypto.randomBytes(parseInt(encryptionEnv.IV_LENGTH))

    // create cipher object - algo + key + iv
    const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv)

    // update cipher object with plain text encryption
    let encrypted = cipher.update(plainText , 'utf-8' , 'hex')

    // Finalize encryption with .final() to handle padding
    encrypted += cipher.final('hex')

    // return iv in hex string : encrypted data
    return `${iv.toString('hex')}:${encrypted}`
}


//====================================== Symmetirc Decryption ======================================
export const decrypt = (inputCipher)=>{

    // split cipher  - [ Iv , encryptedData ]
    const [ iv , encryptedData ] = inputCipher.split(':')
    const bufferedIv = Buffer.from(iv, 'hex')

    // create decripher object - algo + key + iv
    const decripher  = crypto.createDecipheriv('aes-256-cbc', encryptionKey, bufferedIv)

    // update decripher object with encrypted data decryption
    let decrypted = decripher.update(encryptedData , 'hex' , 'utf-8')

    // Finalize decryption with .final() to handle padding
    decrypted += decripher.final('utf-8')
    
    return decrypted
}
