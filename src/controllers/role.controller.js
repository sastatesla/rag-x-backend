import { RoleService } from "../services/index.js";
import { ApiResponse } from "../utils/ApiResponse.js";

class RoleController {
    constructor(){
        this.createRole = this.createRole.bind(this);
        this.getRoles = this.getRoles.bind(this);
        this.deleteRole = this.deleteRole.bind(this);
    }

    async createRole(req,res,next) {

        const apiResponse = new ApiResponse(res);

        try {
            const {roleName, description} = req.body;
            const role = await RoleService.createRole(roleName, description);

            return apiResponse.successResponse({
                message:'Role created succesfully',
                data: role
            })
        } catch (error) {
            next(error);
        }
        
    }

    async getRoles(req, res, next){

        const apiResponse = new ApiResponse(res);
        const roleId = req.params.id;

        try {
            const roles = await RoleService.getRoles(roleId);
            return apiResponse.successResponse({
                message: 'Roles fetched successfully',
                data: roles
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteRole(req, res, next) {
        const apiResponse = new ApiResponse(res);

        try {
            const { roleId } = req.params;
            await RoleService.deleteRole(roleId);

            return apiResponse.successResponse({
                message: 'Role deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new RoleController();