const Homey = require('homey');
const util = require('/lib/util.js');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = class gateBoxDevice extends Homey.Device {

	// Device init
	onInit() {
		this.setAvailable();
	
		this.polling = true;
		this.pinging = false;

		this.addListener('poll', this.pollDevice);
		this.addListener('ping', this.pingDevice);

		// register a capability listener
		this.registerCapabilityListener('button', this.onCapabilityButton.bind(this));

		// Enable device polling
		this.emit('poll');
	}

	async pollDevice() 
	{
		while (this.polling && !this.pinging) {
			await util.sendGetCommandAuth('/api/gate/state',this.getSetting('address'),this.getSetting('username'),this.getSetting('password'))
			.then(result => {
				// On success - update Homey's device state
				this.setAvailable();
				let state = false;
				if(result.currentPos!=0) state = true;
				
				if (state != this.getCapabilityValue('alarm_contact')) {
					this.setCapabilityValue('alarm_contact', state)
						.catch( err => {
							this.error(err);
						})
				}
			})
			.catch(error => {
				this.polling = false;
				this.pinging = true;
				this.emit('ping');
				return;
			});					
			await delay(this.getSetting('poll_interval'));
		}  

    }

	async pingDevice() 
	{
		while (!this.polling && this.pinging) {
			this.setUnavailable();
			await util.sendGetCommandAuth('/api/device/state',this.getSetting('address'),this.getSetting('username'),this.getSetting('password'))
			.then(result => {
				if(result.type=='gateBox' && result.id==this.getData().id)
				{
					this.setAvailable();
					this.polling = true;
					this.pinging = false;
					this.emit('poll');
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
		this.polling = false;
		this.pinging = false;
	}

	// this method is called when the Device has requested a state change (button pressed)
	async onCapabilityButton( value, opts ) {

		// send a command to primary output
		util.sendGetCommandAuth('/s/p',this.getSetting('address'),this.getSetting('username'),this.getSetting('password'))
		.catch(error => {
				// Error occured
				// Set the device as unavailable
				this.log(error);
				this.polling = false;
				this.pinging = true;
				this.emit('ping');
		})
	}

}