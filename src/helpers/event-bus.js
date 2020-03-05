/**
 * Initialize a new event bus instance.
 *
 * @param {string} event - Listener event.
 * @param {Function} callback - Write some function.
 * @see https://pineco.de/creating-a-javascript-event-bus/
 */
export default class EventBus {
	/**
	 * Initialize a new event bus instance.
	 *
	 * @see https://pineco.de/creating-a-javascript-event-bus/
	 */

	constructor() {
		this.bus = document.createElement('fakeElement');
	}
	/**
	 * Initialize a new event bus instance.
	 *
	 * @param {string} event - Listener event.
	 * @param {Function} callback - Write some function.
	 */
	addEventListener(event, callback) {
		this.bus.addEventListener(event, callback);
	}

	/**
	 * Remove an event listener.
	 *
	 * @param {string} event - Listener event.
	 * @param {Function} callback - Write some function.
	 */
	removeEventListener(event, callback) {
		this.bus.removeEventListener(event, callback);
	}
	/**
	 * Dispatch an event.
	 *
	 * @param {string} event - Listener event.
	 * @param {object} detail - Storage data.
	 */
	dispatchEvent(event, detail = {}) {
		this.bus.dispatchEvent(new CustomEvent(event, { detail }));
	}
}
