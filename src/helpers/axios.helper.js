import axios from "axios";
import eventEmitter from "../utils/logging.js"; // make sure .js is used in ES modules

class AxiosHelper {
	constructor(baseUrl, headers = undefined, timeout = 10000) {
		this.baseUrl = baseUrl;
		this.endPoint = "";
		this.headers = headers || { "Content-Type": "application/json" };
		this.data = {};
		this.params = {};
		this.timeout = timeout || 10000;
		this.method = "GET";
	}

	async request(
		endPoint = "",
		headers = {},
		method = "GET",
		data = undefined,
		params = undefined,
		timeout = undefined,
		options = {}
	) {
		this.endPoint = endPoint;
		this.headers = { ...this.headers, ...headers };
		this.data = data;
		this.params = params;
		this.timeout = timeout || this.timeout;
		this.method = method || this.method;

		const axiosConfig = {
			baseURL: this.baseUrl,
			url: this.endPoint,
			headers: this.headers,
			data: this.data,
			params: this.params,
			timeout: this.timeout,
			method: this.method,
			validateStatus: (status) => {
				return status >= 200 && status < 300;
			},
			...options
		};

		try {
			eventEmitter.emit(
				"logging",
				`Axios payload - ${JSON.stringify(axiosConfig)}`
			);

			const response = await axios(axiosConfig);
			return response.data || response;
		} catch (error) {
			eventEmitter.emit(
				"logging",
				`ERROR IN AXIOS HELPER - ${JSON.stringify(error)}`
			);

			if (error.response) {
				return error.response.data || error.response;
			}
			throw error;
		}
	}
}

export default AxiosHelper;
