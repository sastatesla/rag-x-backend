import AxiosHelper from "./axios.helper.js";
import { DEFAULT_PHONE_NUMBERS, DEFAULT_OTP, DEFAULT_OTP_LENGTH, MESSAGE_TEMPLATE, MSG_TEMPLATE_ID, OTP_RESPONSE_SLUGS } from '../utils/constants.js';
import  eventEmitter from '../utils/logging.js'; 

async function sendOtp(phoneNumber) {
	if (DEFAULT_PHONE_NUMBERS.includes(phoneNumber.toString())) {
		return DEFAULT_OTP.toString();
	}

	if (
		(process.env.OTP_API_KEY || "").toString().trim() === "" ||
		(process.env.OTP_SENDER_ID || config.otp.senderId || "").toString().trim() === "" ||
		(process.env.OTP_BASE_URL || "").toString().trim() === ""
	) {
		throw new Error("OTP Service temporarily unavailable");
	}

	const data = {
		apikey: process.env.OTP_API_KEY,
		senderid: process.env.OTP_SENDER_ID,
		number: phoneNumber,
		message: MESSAGE_TEMPLATE.OTP,
		format: "json",
		template_id: MSG_TEMPLATE_ID.TEMP01,
		digit: DEFAULT_OTP_LENGTH
	};

	try {
		const axiosHelper = new AxiosHelper(process.env.OTP_BASE_URL);
		const response = await axiosHelper.request(
			process.env.SEND_OTP_ENDPOINT,
			undefined,
			"POST",
			data
		);

		return JSON.stringify(response?.data || response);
	} catch (error) {
		throw new Error(`Error sending OTP - ${error?.message || error}`);
	}
}

async function verifyOtp(phoneNumber, otp, sessionId) {
	if (
		DEFAULT_PHONE_NUMBERS.includes(phoneNumber) &&
		otp.toString().trim() === DEFAULT_OTP.toString()
	) {
		return true;
	}

	if (
		(process.env.OTP_API_KEY || "").toString().trim() === "" ||
		(process.env.OTP_SENDER_ID || "").toString().trim() === "" ||
		(process.env.OTP_BASE_URL || "").toString().trim() === ""
	) {
		throw new Error("OTP Service temporarily unavailable");
	}

	const data = {
		apikey: process.env.OTP_API_KEY,
		senderid: process.env.OTP_SENDER_ID,
		to: phoneNumber,
		otp,
		sessionid: sessionId,
		format: "json"
	};

	try {
		const axiosHelper = new AxiosHelper(process.env.OTP_BASE_URL);
		const response = await axiosHelper.request(
			process.env.VERIFY_OTP_ENDPOINT,
			undefined,
			"POST",
			data
		);

		eventEmitter.emit("logging", `Verify OTP - ${JSON.stringify(response)}`);

		const responseDetails = response.Details || response.data?.Details;
		if (!responseDetails) {
			throw new Error("Error occurred at OTP server");
		}

		switch (responseDetails) {
			case OTP_RESPONSE_SLUGS.VERIFIED:
				return true;
			case OTP_RESPONSE_SLUGS.INVALID:
				throw new Error("Invalid OTP");
			case OTP_RESPONSE_SLUGS.EXPIRED:
				throw new Error("OTP expired");
			default:
				throw new Error("Invalid OTP");
		}
	} catch (error) {
		throw new Error("Error verifying OTP: " + (error?.message || error));
	}
}

export default {
	sendOtp,
	verifyOtp
};
