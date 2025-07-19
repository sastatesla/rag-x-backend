import express from "express";

import validate from "../middlewares/validate.js";
import { RagController } from "../controllers/index.js";

const router = express.Router();

router.post(
    "/chat",
    RagController.ragChat
);



export default router;