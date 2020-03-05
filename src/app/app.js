import '../style.scss';

import EventBus from '../helpers/event-bus';
import handleUsers from './components/users.js';

window.EventBus = new EventBus;
/**
 * Load first template.
 *
 */

/**
 *
 */
function rootTemplate(){
	const template = (
		`<div class="container">
      <section>
        <button id="loadUsers">Получить данные пользователей</button>
        <div class="scroll-container">
          <div class="users"></div>
        </div>
      </section>
      <footer></footer>
    </div>`
	).trim();
	const root = document.getElementById('app');
	root.insertAdjacentHTML('afterbegin', template);
}
document.addEventListener('DOMContentLoaded', () => {
	rootTemplate();
	const componentDidMount = new Promise((resolve, reject) => {
		const root = document.getElementById('app');
		if(root.hasChildNodes()) {
			resolve('root is load');
		} else {
			reject('root element is empty');
		}
	});
	componentDidMount.then(result => {
		const button = document.querySelector('#loadUsers');
		button.addEventListener('click', handleUsers);
		window.EventBus.addEventListener('FETCH', ({detail}) => {
			const {isFetch} = detail;
			const {lastPage} = detail;
			console.log(isFetch, lastPage);
			button.disabled = lastPage || isFetch; 
		});
		console.log(result);
	}).catch(err => {
		alert(err);
	});
});
