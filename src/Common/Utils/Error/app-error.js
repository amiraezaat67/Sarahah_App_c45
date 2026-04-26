
export class HttpAppError  extends Error {
    constructor( message = 'An error occured' , statusCode = 500, code='INTERNAL_ERROR' , details = null ){
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
    }
}