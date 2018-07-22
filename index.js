require('./src/config.js');

const Controller = require('./src/controller.js');

(async () => {
	await Controller.start();
})();
