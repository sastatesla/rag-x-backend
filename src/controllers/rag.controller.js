import { ApiResponse } from "../utils/ApiResponse.js";

class RagController {
    constructor() {
        this.ragChat = this.ragChat.bind(this);
    }

    async ragChat(req, res, next) {
        const apiResponse = new ApiResponse(res);
        const { userId, message } = req.body;

        try {
            const response = await RagService.chat(userId, message);
            return apiResponse.successResponse({
                message: 'RAG chat response',
                data: response
            });
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