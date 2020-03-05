import api from '../services/api';
import PageStore from '../../helpers/page-store';
import loaderTemplate from './loader.js';
const store = new PageStore;
PageStore.prototype = {
	loadPages: 1,
	totalPages: 0,
	fetchData: false
};

const handleUsers = () => {
	const lastPage = store.totalPages >= store.loadPages;
	store.fetchData = true;
	window.EventBus.dispatchEvent('FETCH', {
		isFetch: store.fetchData,
		lastPage: lastPage
	});
	loaderTemplate();
	api(`users?delay=9&page=${store.loadPages}`).then(res => {
		const {data} = res;
		store.loadPages = res.page + 1;
		store.totalPages = res.total_pages;
		const userData = data.map(item => {
			return {
				id: item.id,
				email: item.email,
				firstName: item.first_name,
				lastName: item.last_name,
				avatar: item.avatar
			};
		});
		renderUsers(userData);
	}).catch(err => alert(err)).then(() => {
		store.fetchData = false;
		loaderTemplate();
		window.EventBus.dispatchEvent('FETCH', {
			isFetch: store.fetchData,
			lastPage: lastPage
		});
	});
};
/**
 * 
 *
 * @param {number} s - El.scrollTop.
 * @param {number} b - El.clientHeight.
 * @param {number} b - El.scrollHeight.
 * @returns {number}
 */

const getDistFromBottom = (s, w, b) => {
	const calc = Math.max(b - (s + w), 0);
	return calc;
};

const renderUsers = users => {
	const usersEl = document.querySelector('.users');
	const usersTemplate = `${users.map(user => `
    <div id=${user.id}>
      <img src=${user.avatar}></img>
      <p>email: ${user.email}</p>
      <p>имя: ${user.firstName}</p>
      <p>фамилия: ${user.lastName}</p>
    </div>`)
		.join(' ')}`.trim();
	usersEl.insertAdjacentHTML('beforeEnd', usersTemplate);
	usersEl.addEventListener('scroll', () => {
		const lastPage = store.totalPages >= store.loadPages;
		const scrollPosition = usersEl.scrollTop;
		const windowSize     = usersEl.clientHeight;
		const bodyHeight     = usersEl.scrollHeight;
		const distToBottom = getDistFromBottom(scrollPosition, windowSize, bodyHeight);
		if(distToBottom === 0 && lastPage && !store.fetchData) {
			handleUsers();
		}
	});
};

export default handleUsers;
