const pick = (obj, keys) => {
	return keys.reduce((finalObj, key) => {
		if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
			finalObj[key] = obj[key];
		}
		return finalObj;
	}, {});
};

export default pick;
