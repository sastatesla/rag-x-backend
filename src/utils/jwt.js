import jwt from "jsonwebtoken"

export default function generateToken(user) {
	return jwt.sign(
		{
			userId: user.id,
			roleId: user.roleId,
			mobile: user.mobile,
			email: user.email,
		},
		process.env.JWT_SECRET,
		{expiresIn: process.env.JWT_EXPIRATION || "1h"}
	)
}
