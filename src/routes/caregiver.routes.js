import express from "express";
import { CaregiverValidation } from "../validations/index.js";
import { CaregiverController } from "../controllers/index.js";
import validate from "../middlewares/validate.js";

const router = express.Router();

router.post(
    "/request",
    validate(CaregiverValidation.caregiverRequestSchema),
    CaregiverController.requestAccess
);
router.post(
    "/approve",
    validate(CaregiverValidation.caregiverApproveSchema),
    CaregiverController.approveRequest
);


export default router;