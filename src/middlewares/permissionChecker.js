import permissions from "../configs/rolePermission.js"
import prisma from "../configs/db.js"


const checkPermission = (basePath) => {  
  return async (req, res, next) => {

    //@ts-ignore
    const roleId = req.user?.roleId

    if (!roleId) {
      return res.status(401).json({ message: "Unauthorized: No role found" })
    }

    try {
      const role = await prisma.roles.findUnique({
        where: { id: roleId },
        select: { roleName: true },
      })

      if (!role) {
        return res.status(403).json({ message: "Forbidden: Role does not exist" })
      }

      const roleName = role.roleName.toLowerCase() 

      const methodToAction = {
        get: "read",
        post: "create",
        put: "update",
        patch: "update",
        delete: "delete"
      }

      const action = methodToAction[req.method.toLowerCase()]
      if (!action) {
        return res.status(400).json({ message: "Unsupported HTTP method" })
      }

      const module = basePath.replace("/", "") 
      const rolePermissions = permissions.find((perm) => perm.role === roleName)

      if (!rolePermissions) {
        return res.status(403).json({ message: "Forbidden: Role not defined in permissions" })
      }

      const modulePerm = rolePermissions.permissions.find(p => p.module === module)

      if (!modulePerm || !modulePerm.actions.includes(action)) {
        return res.status(403).json({ message: `Forbidden: No permission to ${action} ${module}` })
      }

      next()
    } catch (error) {
      console.error("Permission check error:", error)
      return res.status(500).json({ message: "Internal server error" })
    }
  }
}

export default checkPermission
