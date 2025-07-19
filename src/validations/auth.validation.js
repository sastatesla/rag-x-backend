import Joi from "joi";


const registerSchema ={
    body:{
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        roleId: Joi.string().required(),
    }
}


const loginSchema = Joi.object({
	method: Joi.string().valid("email", "otp").required(),

	email: Joi.string().email().when("method", {
		is: "email",
		then: Joi.required(),
		otherwise: Joi.forbidden()
	}),

	password: Joi.string().min(6).when("method", {
		is: "email",
		then: Joi.required(),
		otherwise: Joi.forbidden()
	}),

	phoneNumber: Joi.string().pattern(/^[0-9]{10}$/).when("method", {
		is: "otp",
		then: Joi.required(),
		otherwise: Joi.forbidden()
	}),

	otp: Joi.string().optional(),
	sessionId: Joi.string().optional()
});


export default{
    registerSchema,
    loginSchema
}