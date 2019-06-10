'use strict';

const Homey = require('homey');

class BleBoxApp extends Homey.App {
	
	onInit() {
		this.log('BleBox is running...');
	}
	
}

module.exports = BleBoxApp;