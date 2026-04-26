import { User } from "../Models/index.js";
import BaseRepository from "./base.repository.js";


class UserRepository extends BaseRepository {
    constructor(){
        super(User)
    }

    //////////////////////////////////
    // Custom methods for User entity
    //////////////////////////////////
    // checkEmailDuplication(email) {
    //     return this.findOneDocument({email})
    // }
}

export default new UserRepository();