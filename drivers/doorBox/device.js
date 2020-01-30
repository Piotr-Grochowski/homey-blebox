const Homey = require('homey');
const util = require('/lib/util.js');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = class doorBoxDevice extends Homey.Device {

	// Device init
	onInit() {
		this.setAvailable();
	
		this.pinging = false;

		// register a capability listener
		this.registerCapabilityListener('button', this.onCapabilityButton.bind(this));
	}

	async pingDevice() 
	{
		while (this.pinging) {
			this.setUnavailable();
			await util.sendGetCommand('/api/device/state',this.getSetting('address'))
			.then(result => {
				if(result.type=='gateBox' && result.id==this.getData().id)
				{
					this.setAvailable();
					this.pinging = false;
					return;
				}
			})
			.catch(error => {
				this.log('Device is not reachable, pinging every 60 seconds to see if it comes online again.');
			})
			await delay(60000);
		}

    }

	// Cancel pooling when device is deleted
	onDeleted() {
		this.pinging = false;
	}

	// this method is called when the Device has requested a state change (button pressed)
	async onCapabilityButton( value, opts ) {

		// send a command to primary output
		util.sendGetCommand('/s/p',this.getSetting('address'))
		.catch(error => {
				// Error occured
				// Set the device as unavailable
				this.log(error);
				this.pinging = true;
				this.emit('ping');
		})
	}

}