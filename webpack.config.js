const environment = (process.env.NODE_ENV || 'development').trim();
switch(environment) {
case 'development':
	module.exports = require('./config/webpack.dev.config');
	break;
case 'production':
	module.exports = require('./config/webpack.prod.config');
	break;
}
