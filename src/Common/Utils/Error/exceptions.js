import { HttpAppError } from "./app-error.js";


export class ConflictException extends HttpAppError {
    constructor(message = 'Conflict', details = null) {
        super(message , 409 , 'CONFLICT' , details)
    }
}

export class NotFoundException extends HttpAppError {
    constructor(message = 'Not Found', details = null) {
        super(message , 404 , 'NOT_FOUND' , details)
    }
}

export class BadRequestException extends HttpAppError {
    constructor(message = 'Bad Request', details = null) {
        super(message , 400 , 'BAD_REQUEST' , details)
    }
}

export class InternalServerErrorException extends HttpAppError {
    constructor(message = 'Internal Server Error', details = null) {
        super(message , 500 , 'INTERNAL_SERVER_ERROR' , details)
    }
}


export class TooManyRequestsException extends HttpAppError {
    constructor(message = 'Too Many Requests', details = null) {
        super(message , 429 , 'TOO_MANY_REQUESTS' , details)
    }
}

// Circular dependency issue
