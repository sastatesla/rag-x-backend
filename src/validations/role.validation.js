import Joi from "joi";

const role = {
    body: Joi.object({
        name: Joi.string().required(),
        description: Joi.string().optional()
    })

}

const roleQuery = {
    query: Joi.object({
        id: Joi.string()
    })
}

const roleDelete = {
    params: Joi.object({
        roleId: Joi.string().required()
    })
}

export default {
    role,
    roleQuery,
    roleDelete
};