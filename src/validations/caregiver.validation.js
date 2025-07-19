import Joi from "joi";

const caregiverRequestSchema = Joi.object({
  patientId: Joi.number().integer().required(),
  message: Joi.string().optional().max(500)
});

const caregiverApproveSchema = Joi.object({
  requestId: Joi.number().integer().required(),
  approved: Joi.boolean().required()
});

const caregiverRequestsQuerySchema = Joi.object({
  type: Joi.string().valid("incoming", "outgoing").optional()
});

export default {
    caregiverRequestSchema,
    caregiverApproveSchema,
    caregiverRequestsQuerySchema
}