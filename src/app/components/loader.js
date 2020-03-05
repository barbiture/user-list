import PageStore from '../../helpers/page-store';
const pageStore = new PageStore();
const loaderTemplate = () => {
	const root = document.querySelector('.users');
	const loading = pageStore.fetchData;
	const template = (
		`<div class="loading-users">
      <div class="spinner"></div>
    </div>`
	).trim();
	if(loading) {
		root.insertAdjacentHTML('afterend', template);
	} else {
		const el = document.querySelector('.loading-users');
		el.remove();
	}
};

export default loaderTemplate;
