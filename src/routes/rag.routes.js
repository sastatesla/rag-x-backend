import express from "express";

import validate from "../middlewares/validate.js";
import { RagController } from "../controllers/index.js";

const router = express.Router();

router.post(
    "/chat",
    RagController.ragChat
);

router.get(
    "/llm/status",
    RagController.getLLMStatus
);

router.post(
    "/llm/switch",
    RagController.switchModel
);



export default router;