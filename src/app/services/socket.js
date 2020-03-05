import io from 'socket.io-client';
import {SOCKET_OPEN_ARRAY_URL} from '../../environments/environments';
class Store {
	constructor() {
		this.renderTypePairs();
		this.filterPairs();
		this.scope = '';
		this.pair = '';
		this.filterUpdate = false;
	}
	renderTypePairs() {
		const pairsHandle = (e) => {
			const id = e.detail.pair.charAt(0).toUpperCase() + e.detail.pair.slice(1);
			this.scope = id;
			this.pair = e.detail.pair;
		};
		const filterHandle = (e) => {
			this.filterUpdate = e.detail.init;
		};
		window.EventBus.addEventListener('pairs-init', pairsHandle);
		window.EventBus.addEventListener('filter-init', filterHandle);

		const sokcetByType = (event) => {
			const {data} = event.detail;
			if(this.filterUpdate) {
				if(data.length) {
					const dataFilter = data.filter(i => this.dataFilter.some(s => s.pair === i.p ));
					const allDataFilter = this.allData.filter(i => this.dataFilter.some(s => s.pair === i.pair));
					this.updateFiltered(allDataFilter, dataFilter , this.dataFilter);
				}
				window.EventBus.dispatchEvent('filter-return', {
					pairsFilter: this.dataFilter,
					fetchData: this.fetchData
				});
			}
			if(this.pair === 'search') {
				const dataFilter = data.filter(i => this.dataSearch.some(s => s.pair === i.p ));
				const allDataFilter = this.allData.filter(i => this.dataSearch.some(s => s.pair === i.pair));
				this.updateScope(allDataFilter, dataFilter , this.dataSearch);
			} else {
				const dataScope = this[`dataScope${this.scope}`];
				if(Array.isArray(data) && data.length) {
					window.EventBus.dispatchEvent(`${this.pair}-init`, {
						data: dataScope,
						name: this.pair
					});
					if(dataScope) {
						const dataFilter = data.filter(i => dataScope.some(s => s.pair === i.p ));
						this.updateScope(dataScope, dataFilter, JSON.parse(sessionStorage.getItem(this.pair)));
					}
				}
			}
			
			
		};
		window.EventBus.addEventListener('socket-by-type', sokcetByType);
	}
	filterPairs() {
		const eventPairs = (e) => {
			const {pairs} = e.detail;
			this.fetchData = pairs;
			const filterPairs = data => {
				return JSON.parse(data).filter(d => {
					if(pairs.some(p => p.pair === d.pair))
						return d;
				});
			};
			const datas = {
				forex: filterPairs(sessionStorage.getItem('forex')),
				commodities: filterPairs(sessionStorage.getItem('commodities')),
				stocks: filterPairs(sessionStorage.getItem('stocks')),
				indices: filterPairs(sessionStorage.getItem('indices')),
				crypto: filterPairs(sessionStorage.getItem('crypto')),
			};
			this.filteredData = Object.values(datas)
				.filter(i => i.length !== 0)
				.map(item => item);

			this.dataFilter = [].concat.apply([], this.filteredData);
		};
		window.EventBus.addEventListener('filter-pairs', eventPairs);
	}
}
class Socket extends Store {
	constructor() {
		super();
		this.allData = [];
		this.dataScopeForex = [];
		this.dataScopeCommodities = [];
		this.dataScopeStocks = [];
		this.dataScopeIndices = [];
		this.dataScopeCrypto = [];
		this.forexPairs = {};
		this.commoditiesPairs = {};
		this.stocksPairs = {};
		this.indicesPairs = {};
		this.cryptoPairs = {};
		this.prevData = [];
		this.nextData = [];
		this.filteredData = [];
		this.dataSearch = [];
		this.data;
		window.EventBus.addEventListener('search-pair', this.searchPair.bind(this));
		this.socketOpen = io.connect(SOCKET_OPEN_ARRAY_URL, {secure: true});
	}
	getSocket() {
		this.socketOpen.on('freepairarray', data => {
			this.getData(data);
			window.EventBus.dispatchEvent('socket-by-type', { data: data });
			window.EventBus.dispatchEvent('socket-by-scope', { data: data });
		});
	}
	stopSocket() {
		this.socketOpen.close();
	}
	searchPair(e) {
		const {pair} = e.detail;
		const filterPairs = (pairs) => {
			const data = JSON.parse(pairs);
			const match = /[-/]/g;
			return data.filter(i => i.pair.toLowerCase().replace(match, '').indexOf(pair.toLowerCase()) >= 0 );
		};
		const datas = {
			forex: filterPairs(sessionStorage.getItem('forex')),
			commodities: filterPairs(sessionStorage.getItem('commodities')),
			stocks: filterPairs(sessionStorage.getItem('stocks')),
			indices: filterPairs(sessionStorage.getItem('indices')),
			crypto: filterPairs(sessionStorage.getItem('crypto')),
		};
		this.filteredData = Object.values(datas).filter(i => i.length !== 0)
			.map(item => item);
		this.dataSearch = [].concat.apply([], this.filteredData);
		window.EventBus.dispatchEvent('search-init', {
			data: this.dataSearch
		});
	}
	scopeByMap(item) {
		const ask = 'a' in item ? item.a.toFixed(item.precision) : item.ask;
		const bid = 'b' in item ? item.b.toFixed(item.precision) : item.bid;
		const oldAsk = 'oldAsk' in item ? item.oldAsk : ask;
		const oldBid = 'oldBid' in item ? item.oldBid : bid;
		const progressAsk = oldAsk < ask ? 'up' : 'down';
		const progressBid = oldBid < bid ? 'up' : 'down';
		const pair = 'p' in item ? item.p : item.pair;
		if(pair === 'CAD/CHF') {
			// if(typeof item.bid === 'number') {
			// const progressBid = oldBid < item.bid.toFixed(item.precision) ? 'up' : 'down';
			// console.log(oldBid, item.bid, progressBid);
			// }
		}
		return {
			ask: ask,
			bid: bid,
			oldAsk: oldAsk,
			oldBid: oldBid,
			realAsk: item.a,
			realBid: item.b,
			historic: item.historic,
			progressAsk: progressAsk,
			progressBid: progressBid,
			hours: item.hours,
			id: item.id,
			laverage: item.laverage,
			margin: item.margin,
			market: item.market,
			pair: pair,
			persent: item.persent,
			pip: item.pip,
			precision: item.precision,
			time: 't' in item ? item.t : item.time,
			volumeStep: 'volume_step' in item ? item.volume_step : item.volumeStep,
			helpers: this.findType(pair)
		};
	}
	findType(pair) {
		if(this.forexPairs.some(i => i === pair)) {
			return {
				type: 'forex',
				iconFirst: `flag-icon flag-icon-${pair.substring(0, 2).toLowerCase()}`,
				iconSecond: `flag-icon flag-icon-${pair.substring(4, 6).toLowerCase()}`
			};
		}
		if(this.commoditiesPairs.some(i => i === pair)) {
			return {
				type: 'commodities',
				iconFirst: `commod-icon commod-icon-${pair.replace('/USD', '').toLowerCase()}`
			};
		}
		if(this.stocksPairs.some(i => i === pair)) {
			return {
				type: 'stocks',
				iconFirst: `stocks-icon stocks-icon-${pair.toLowerCase()}`
			};
		}
		if(this.indicesPairs.some(i => i === pair)) {
			return {
				type: 'indices',
				iconFirst: `indices-icon indices-icon-${pair.toLowerCase()}`
			};
		}
		if(this.cryptoPairs.some(i => i === pair)) {
			return {
				type: 'crypto',
				iconFirst: `crypto-icon crypto-icon-${pair.replace('-USD', '').toLowerCase()}`
			};
		}
	}

	updateFiltered(prev, next, store) {
		// console.log(prev, next, store);
		const newArr = prev.map(p => {
			const nxt = next.find(n => n.p === p.pair);
			if(nxt) {
				const copy = {...p, ...nxt};
				this.prevData = this.scopeByMap(copy);
				p.oldAsk = this.prevData.ask;
				p.oldBid = this.prevData.bid;
				p.bid = nxt.b.toFixed(p.precision);
				p.ask = nxt.a.toFixed(p.precision);
				p.progressAsk = p.oldAsk < p.ask ? 'up' : 'down';
				p.progressBid = p.oldBid < p.bid ? 'up' : 'down';
				return this.prevData;
			} 
			return p;
		});
		const oldArr = store.map(p => {
			const prv = prev.find(n => n.p === p.pair);
			if(prv) {
				const copy = {...p, ...prv};
				this.prevData = this.scopeByMap(copy);
				p.oldAsk = this.prevData.ask;
				p.oldBid = this.prevData.bid;
				p.pair = this.prevData.pair;
				p.bid = prv.b.toFixed(p.precision);
				p.ask = prv.a.toFixed(p.precision);
				return this.prevData;
			} 
			return p;
		});
		if(newArr.length === oldArr.length) {
			window.EventBus.dispatchEvent('filter-update', {
				prevEl: oldArr,
				nextEl: newArr,
				fetchData: this.fetchData
			});
		}
	}
	updateScope(prev, next, store) {
		// console.log(prev, next, store);
		const newArr = prev.map(p => {
			const nxt = next.find(n => n.p === p.pair);
			if(nxt) {
				const copy = {...p, ...nxt};
				this.prevData = this.scopeByMap(copy);
				p.oldAsk = this.prevData.ask;
				p.oldBid = this.prevData.bid;
				p.pair = this.prevData.pair;
				p.bid = nxt.b.toFixed(p.precision);
				p.ask = nxt.a.toFixed(p.precision);
				return this.prevData;
			} 
			return p;
		});
		const oldArr = store.map(p => {
			const prv = prev.find(n => n.p === p.pair);
			if(prv) {
				const copy = {...p, ...prv};
				this.prevData = this.scopeByMap(copy);
				p.oldAsk = this.prevData.ask;
				p.oldBid = this.prevData.bid;
				p.pair = this.prevData.pair;
				p.bid = prv.b.toFixed(p.precision);
				p.ask = prv.a.toFixed(p.precision);
				return this.prevData;
			} 
			return p;
		});
		// debugger;
		if(newArr.length === oldArr.length) {
			window.EventBus.dispatchEvent('upd-pairs', {
				prevEl: oldArr,
				nextEl: newArr
			});
		}
	}
	setStorage(dataScope, pair) {
		if(sessionStorage.getItem(pair) === null) {
			sessionStorage.setItem(pair, JSON.stringify(dataScope));
		} else if( JSON.parse(sessionStorage.getItem(pair)).length === 0) {
			sessionStorage.setItem(pair, JSON.stringify(dataScope));
		}
	}
	scopeByType(typeArray, key, data) {
		return this[typeArray] = data.filter(item => {
			if(key.some(pair => item.p === pair)) {
				return item;
			}
		}).map(item => {
			return this.scopeByMap(item);
		});
	}
	getData(data) {
		if ('forexpair' in data) {
			this.forexPairs = data.forexpair;
		}
		if ('commodpair' in data) {
			this.commoditiesPairs = data.commodpair;
		}
		if ('stockpair' in data) {
			this.stocksPairs = data.stockpair;
		}
		if ('indices' in data) {
			this.indicesPairs = data.indices;
		}
		if ('crypto' in data) {
			this.cryptoPairs = data.crypto;
		}
		// console.log(data)
		if(Array.isArray(data)) {
			// TODO:: make like , dataScopeByType(forex) if length return dataScopeForex
			if(this.dataScopeForex && this.dataScopeForex.length === 0 && this.dataScopeForex.length <= this.forexPairs.length) {
				this.dataScopeForex = this.scopeByType('dataScopeForex', this.forexPairs, data);
				this.setStorage(this.dataScopeForex, 'forex');
			}
			if(this.dataScopeCommodities && this.dataScopeCommodities.length === 0 && this.dataScopeCommodities.length <= this.commoditiesPairs.length) {
				this.dataScopeCommodities = this.scopeByType('dataScopeCommodities', this.commoditiesPairs, data);
				this.setStorage(this.dataScopeCommodities, 'commodities');
			}
			if(this.dataScopeStocks && this.dataScopeStocks.length === 0 && this.dataScopeStocks.length <= this.stocksPairs.length) {
				this.dataScopeStocks = this.scopeByType('dataScopeStocks', this.stocksPairs, data);
				this.setStorage(this.dataScopeStocks, 'stocks');
			}
			if(this.dataScopeIndices && this.dataScopeIndices.length === 0 && this.dataScopeIndices.length <= this.indicesPairs.length) {
				this.dataScopeIndices = this.scopeByType('dataScopeIndices', this.indicesPairs, data);
				this.setStorage(this.dataScopeIndices, 'indices');
			}
			if(this.dataScopeCrypto && this.dataScopeCrypto.length === 0 && this.dataScopeCrypto.length <= this.cryptoPairs.length) {
				this.dataScopeCrypto = this.scopeByType('dataScopeCrypto', this.cryptoPairs, data);
				this.setStorage(this.dataScopeCrypto, 'crypto');
			}
			this.allData = [].concat(
				...this.dataScopeForex,
				...this.dataScopeCommodities,
				...this.dataScopeStocks,
				...this.dataScopeIndices,
				...this.dataScopeCrypto
			);
		}
		
	}
}

export default Socket;