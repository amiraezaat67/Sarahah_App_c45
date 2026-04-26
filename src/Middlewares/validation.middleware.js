
import { BadRequestException } from "../Common/index.js";


const valdidation = (schema)=>{
    return (req,res,next)=>{

        const valdidationErrors = []

        for (const key in schema) {
            const  { error }  = schema[key].validate(req[key] , { abortEarly : false })

            if(error){
                valdidationErrors.push( error.details.map((err) => err) )
            }       
        }

        if(valdidationErrors.length){
            throw new BadRequestException('Validation error' , { validationErrors: valdidationErrors.flat() })
        }

        next()
    }
}

export default valdidation