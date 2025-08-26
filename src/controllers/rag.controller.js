import { ApiResponse } from "../utils/ApiResponse.js";
import RagChat from "../services/rag.service.js";

class RagController {
    constructor() {
        this.ragChat = this.ragChat.bind(this);
        this.getLLMStatus = this.getLLMStatus.bind(this);
        this.switchModel = this.switchModel.bind(this);
    }

    async ragChat(req, res, next) {
        const apiResponse = new ApiResponse(res);
        const { userId, message, sessionId, context, userRole: requestUserRole } = req.body;
        
        // Determine user role - prioritize authenticated user, fallback to request body
        const userRole = req.user?.roleId ? 'admin' : (requestUserRole || 'user');
        const isAdmin = userRole === 'admin';

        try {
            const response = await RagChat.ask({
                message,
                userId,
                sessionId,
                context,
                userRole,
                isAdmin
            });

            return apiResponse.successResponse({
                message: `${isAdmin ? 'Admin' : 'User'} RAG chat response`,
                data: response
            });
        } catch (error) {
            next(error);
        }
    }

    async getLLMStatus(req, res, next) {
        const apiResponse = new ApiResponse(res);

        try {
            const status = await RagChat.getLLMStatus();
            return apiResponse.successResponse({
                message: 'LLM status retrieved',
                data: status
            });
        } catch (error) {
            next(error);
        }
    }

    async switchModel(req, res, next) {
        const apiResponse = new ApiResponse(res);
        const { modelName } = req.body;

        try {
            const success = await RagChat.switchModel(modelName);
            if (success) {
                return apiResponse.successResponse({
                    message: `Successfully switched to model: ${modelName}`,
                    data: { modelName }
                });
            } else {
                return apiResponse.errorResponse({
                    message: `Failed to switch to model: ${modelName}`,
                    statusCode: 400
                });
            }
        } catch (error) {
            next(error);
        }
    }
}

export default new RagController();








// export async function chatController(req, res) {
//   const { userId, message } = req.body
//   try {
//     const response = await runRagChat({ userId, message })
//     res.json({ response })
//   } catch (err) {
//     res.status(500).json({ error: err.message })
//   }
// }