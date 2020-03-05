import {API_URL} from '../../environments/environments.js';
const api = (path) => {
	console.log(path);
	const optionGet = {
		headers: {
			'Content-Type': 'application/json'
		},
		method: 'GET'
	};
	return new Promise((resolve, reject) => {
		fetch(`${API_URL}/${path}`, optionGet)
			.then(res => {
				switch(res.status) {
				case 200:
					return resolve(res.json());
				case 404:
					return reject('user not found');
				default:
					return res.json().then(err => reject(err));
				}
			});
	});
};
export default api;
