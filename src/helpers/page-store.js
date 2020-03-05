const PageStore = new function() {
	let instance;
	return function() {
		if (instance !== void 0) return instance;
		return instance = this;
	};
};


export default PageStore;
