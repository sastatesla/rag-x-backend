class ApiError extends Error {
    constructor(statusCode, message, messageCode, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.messageCode = messageCode; 
        this.details = details;
    }

    static BadRequest(message, messageCode = 'BAD_REQUEST', details = null) {
        return new ApiError(400, message, messageCode, details);
    }

    static Invalid(message, messageCode = 'INVALID', details = null) {
        return new ApiError(400, message, messageCode, details);
    }

    static AlreadyExists(message, messageCode = 'ALREADY_EXISTS', details = null) {
        return new ApiError(400, message, messageCode, details);
    }

    static Unauthorized(message, messageCode = 'UNAUTHORIZED', details = null) {
        return new ApiError(401, message, messageCode, details);
    }

    static Forbidden(message, messageCode = 'FORBIDDEN', details = null) {
        return new ApiError(403, message, messageCode, details);
    }

    static NotFound(message, messageCode = 'NOT_FOUND', details = null) {
        return new ApiError(404, message, messageCode, details);
    }

    static InternalServerError(message='An unexpected error occured', messageCode = 'INTERNAL_SERVER_ERROR', details = null) {
        return new ApiError(500, message, messageCode, details);
    }
}

export default ApiError;