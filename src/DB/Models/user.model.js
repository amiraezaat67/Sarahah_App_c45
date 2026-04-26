import mongoose from "mongoose";
import { USER_ROLES, GENDER , STATUS, PROVIDERS, CHANNELS } from "../../Common/index.js";

const userSchema = new mongoose.Schema({
    firstName:{
        type: String,
        required: true,
        trim:true,
        minLength:[3, 'First name must be at least 3 characters long'],
        maxLength:[50, 'First name must be less than 50 characters long']
    },
    lastName:{
        type: String,
        required: true,
        trim:true,
        minLength:[3, 'Last name must be at least 3 characters long'],
        maxLength:[50, 'Last name must be less than 50 characters long']
    },
    email:{
        type: String,
        required: true,
        index:{
            name:'email_unique',
            unique:true
        }
    },
    password:{
        type: String,
        required: true
    },
    role:{
        type: String,
        enum:Object.values(USER_ROLES),
        default:USER_ROLES.USER
    },
    gender:{
        type: String,
        enum:Object.values(GENDER)
    },
    status:{
        type: String,
        enum:Object.values(STATUS),
        default:STATUS.ACTIVE
    },
    phoneNumber:String,
    age:Number,
    googleSub:{
        type:String,
        index:{
            name:'idx_googleSub_unique',
            unique:true
        },
    },
    provider:{
        type:String,
        enum:Object.values(PROVIDERS),
        default:PROVIDERS.SYSTEM
    },
    profilePicture: String,
    isEmailVerified:{
        type:Boolean,
        default:false
    },
    OTPs:[{
        value:{
            type:String,
            required:true
        },
        expireAt:{
            type:Date,
            default: Date.now()  + 5 * 60 * 1000
        },
        channel:{
            type:String,
            enum:Object.values(CHANNELS)
        }
    }]
},{
    toJSON: { getters: true},
    toObject: { getters: true },
    timestamps: true
})

// Create Getter Virtual for fullName
userSchema.virtual('fullName').get(function() {
    return this.firstName + ' ' + this.lastName;
})

// Safty check for model`
const User = mongoose.models.User || mongoose.model('User', userSchema)

export default User
