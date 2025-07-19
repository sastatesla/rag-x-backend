import prisma from "../configs/db.js";
import ApiError from "../utils/ApiError.js";

class RoleService {
    constructor(){
        this.createRole = this.createRole.bind(this);
        this.getRoles = this.getRoles.bind(this);
        this.deleteRole = this.deleteRole.bind(this);
    }

    async createRole(roleName, ddescription){
        try {
            
            const existingRole = await prisma.role.findUnique({
                where: {
                    roleName: roleName
                }
            });

            if (existingRole){
                throw ApiError.AlreadyExists('Role already exists', 'ROLE_ALREADY_EXISTS');
            }
            const role = await prisma.role.create({
                data: {
                    roleName,
                    description: ddescription
                }
            });
            return role;
            
        } catch (error) {
            throw ApiError.InternalServerError('Failed to create role', 'ROLE_CREATION_ERROR', error);
        }

    }

    async getRoles(roleId) {

        try {
            if(roleId){
                const role = await prisma.role.findUnique({
                    where: {
                        id: roleId
                    }
                });

                if (!role) {
                    throw ApiError.NotFound('Role not found', 'ROLE_NOT_FOUND');
                }

                return role;
            }
            
            const roles = await prisma.role.findMany();
            return roles;
            
        } catch (error) {
            
        }
    }

    async deleteRole(roleId) {
        try {
            const role = await prisma.role.findUnique({
                where: {
                    id: roleId
                }
            });

            if (!role) {
                throw ApiError.NotFound('Role not found', 'ROLE_NOT_FOUND');
            }

            await prisma.role.delete({
                where: {
                    id: roleId
                }
            });

        } catch (error) {
            throw ApiError.InternalServerError('Failed to delete role', 'ROLE_DELETION_ERROR', error);
        }
    }
}
export default new RoleService();