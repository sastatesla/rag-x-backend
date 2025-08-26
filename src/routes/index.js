import express from "express"
import path from "path"
import checkPermission from "../middlewares/permissionChecker.js"
import roleRoute from "./role.routes.js"
import authRoute from "./auth.routes.js"
import auth from "../middlewares/auth.js"
import ragRoute from "./rag.routes.js"
const router = express.Router()

const defaultRoutes = [
	
	{
		name: 'Role',
		path: "/role",
		route: roleRoute,
	},
	{
		name: 'Auth',
		path: "/auth",
		route: authRoute,

	},
	
	{
		name: 'RAG',
		path: "/rag",
		route: ragRoute,
		isProtected: false  // Temporarily make RAG routes public for testing
	}
]



defaultRoutes.forEach(({ name, path, route, isProtected }) => {
	try {
	  if (isProtected) {
		router.use(path, auth,checkPermission(path), route)
	  } else {
		router.use(path, route)
	  }
	} catch (err) {
	  throw new Error(`Failed to mount ${name} at path: ${path}. Error: ${err.message}`)
	}
  })
  

export default router
