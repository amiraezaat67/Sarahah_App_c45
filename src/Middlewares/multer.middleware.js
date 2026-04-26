import multer from "multer";
import fs from 'node:fs'
import { fileExtensions } from "../Common/index.js";

//   uploads/profile
const multerLocal = (path) => {
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            const destination = `uploads/${path}`
            fs.mkdirSync(destination  , { recursive : true })
            cb(null, destination)
        },
        filename:function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
            cb(null, uniqueSuffix + '.' + file.originalname)
        } 
    })

    const fileFilter = function(req,file,cb){
        const [fileType, fileExtension] =  file.mimetype.split('/')        
        const allowedExtensions = fileExtensions[fileType]        
        if(allowedExtensions.includes(fileExtension)){
            return cb(null , true)
        }

        return cb( new Error('File type not allowed') , false)
    }
    return multer({fileFilter , storage})
}


export default multerLocal;