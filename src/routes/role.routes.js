import express from 'express';
import { RoleController } from "../controllers/index.js";
import validate from "../middlewares/validate.js";
import { RoleValidation } from '../validations/index.js';

const router = express.Router();

router.post(
    '/create',
    validate(RoleValidation.role),
    RoleController.createRole
);

router.get(
    '/list',
    validate(RoleValidation.roleQuery),
    RoleController.getRoles
)
router.delete(
    '/delete/:id',
    validate(RoleValidation.deleteRole),
    RoleController.deleteRole
);

export default router;