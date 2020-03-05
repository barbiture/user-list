import {POST_SERVER} from '../../environments/environments.js';

export default class GetData {
	constructor(path) {
		return this.getUrl(path);
	}
	getUrl(path) {
		let controller = new AbortController();
		const optionGet = {
			cors: {
				origin: ['*'],
				headers: ['Access-Control-Allow-Origin','Access-Control-Allow-Headers','Origin','X-Requested-With','Content-Type','CORELATION_ID'],
				credentials: true
			},
			method: 'GET',
			signal: controller.signal
		};
		return new Promise((resolve, reject) => {
			fetch(`${POST_SERVER}/${path}`, optionGet)
				.then(res => {
					const json = res.json();
					if (res.status === 200) {
						return resolve(json);
					} else {
						return json.then(err => reject(err));
					}
				});
		});
	}
}
