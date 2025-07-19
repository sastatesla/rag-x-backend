import prisma from "../configs/db.js";
import ApiError from "../utils/ApiError.js";
import bcrypt from "bcrypt";
import generateToken from "../utils/jwt.js";
import jwt from "jsonwebtoken";
import sendOtp from "../helpers/otp.helper.js";

class AuthService {
	constructor() {
		this.emailLogin = this.emailLogin.bind(this);
		this.register = this.register.bind(this);
		this.sendOTP = this.sendOTP.bind(this);
		this.verifyOTP = this.verifyOTP.bind(this);
		this.refreshToken = this.refreshToken.bind(this);
        this.getProfile = this.getProfile.bind(this);
	}

	async register(name, email, password, roleId) {
		try {
			const existingUser = await prisma.user.findUnique({ where: { email } });

			if (existingUser) {
				throw ApiError.AlreadyExists('User already exists', 'USER_ALREADY_EXISTS');
			}

			const hashedPassword = await bcrypt.hash(password, 10);

			const user = await prisma.user.create({
				data: {
					name,
					email,
					password: hashedPassword,
                    roleId
				}
			});

			const token = await generateToken(user);
			return { user, token };
		} catch (error) {
			throw ApiError.BadRequest('Registration failed', 'REGISTRATION_ERROR', error);
		}
	}

	async emailLogin(email, password) {
		try {
			const user = await prisma.user.findUnique({ where: { email } });

			if (!user) {
				throw ApiError.NotFound('User not found', 'USER_NOT_FOUND');
			}

			const isMatch = await bcrypt.compare(password, user.password);
			if (!isMatch) {
				throw ApiError.Unauthorized('Invalid credentials', 'INVALID_CREDENTIALS');
			}

			const token = await generateToken(user);
			return { user, token };
		} catch (error) {
			throw ApiError.BadRequest('Login failed', 'LOGIN_FAILED', error);
		}
	}

	async sendOTP(phoneNumber) {
		try {
			const otp = await sendOtp(phoneNumber); 
return {
				sessionId: JSON.parse(otp).Details || null
}
		} catch (error) {
			throw ApiError.Internal('Failed to send OTP', 'OTP_SEND_FAILED', error);
		}
	}

	async verifyOTP(phoneNumber, otp, sessionId, roleId) {
		try {
			const isValid = await verifyOtp(phoneNumber, otp, sessionId);
			if (!isValid) throw ApiError.Unauthorized('OTP Verification failed', 'INTERNAL_ERROR');

			let user = await prisma.user.findUnique({ where: { phoneNumber } });

			if (!user) {
				user = await prisma.user.create({
					data: {
						phoneNumber,
						roleId: roleId 
					}
				});
			}

			const token = await generateToken(user);
			return { user, token };
		} catch (error) {
			throw ApiError.BadRequest('OTP verification failed', 'OTP_VERIFICATION_FAILED', error);
		}
	}

	async refreshToken(refreshToken) {
		try {
			const payload = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);
			const user = await prisma.user.findUnique({ where: { id: payload.id } });

			if (!user) {
				throw ApiError.Unauthorized('User not found', 'USER_NOT_FOUND');
			}

			const token = await generateToken(user);
			return { user, token };
		} catch (error) {
			throw ApiError.Unauthorized('Invalid refresh token', 'INVALID_REFRESH_TOKEN', error);
		}
	}

    async getProfile(userId) {
		try {
			const user = await prisma.user.findUnique({
				where: { id: userId }
			});

			if (!user) {
				throw ApiError.NotFound('User not found', 'USER_NOT_FOUND');
			}

			return user;
		} catch (error) {
			throw ApiError.BadRequest('Failed to fetch profile', 'PROFILE_FETCH_FAILED', error);
		}
	}
}

export default new AuthService();
