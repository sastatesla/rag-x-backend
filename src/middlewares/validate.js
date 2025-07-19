import Joi from 'joi';
import httpStatus from 'http-status';
import { ApiResponse } from '../utils/ApiResponse.js';
import pick from '../utils/pick.js'; 

const validate = (schema) => {
	return (req, res, next) => {
		const validSchema = pick(schema, ['params', 'query', 'body']);
		const obj = pick(req, Object.keys(validSchema));

		const { value, error } = Joi.compile(validSchema)
			.prefs({ errors: { label: 'key' }, abortEarly: false })
			.validate(obj);

		if (error) {
			const response = new ApiResponse(res);
			const errorMessage = error.details.map((d) => d.message).join(', ');

			response.errorResponse({
				statusCode: httpStatus.BAD_REQUEST,
				message: errorMessage,
				errorCode: 'validation_error',
			});

			return; 
		}

		Object.assign(req, value);
		next();
	};
};

export default validate;
