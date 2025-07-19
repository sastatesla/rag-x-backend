import express from "express";
import { AuthController } from "../controllers/index.js";
import validate from "../middlewares/validate.js";
import { AuthValidation } from "../validations/index.js";

const router = express.Router();

router.post(
    "/register",
    validate(AuthValidation.registerSchema),
    AuthController.register
)
router.post(
    "/login",
    validate(AuthValidation.loginSchema),
    AuthController.login
)
router.post(
    "/verify-otp",
    validate(AuthValidation.verifyOTPSchema),
    AuthController.verifyOTP
)
router.post(
    "/refresh-token",
    validate(AuthValidation.refreshTokenSchema),
    AuthController.refreshToken
)
router.get(
    "/profile",
    validate(AuthValidation.getProfileSchema),
    AuthController.getProfile
)

export default router;