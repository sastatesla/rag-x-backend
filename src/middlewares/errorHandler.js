
export const errorHandler = (err, req, res, next) => {
	const statusCode = err.statusCode || 500;
	const errorCode = err.messageCode || 'INTERNAL_SERVER_ERROR';
	const message = err.message || 'Something went wrong';

	res.status(statusCode).json({
		success: false,
		status: statusCode,
		message,
		code: errorCode,
		details: err.details || null,
		stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
	});
};
