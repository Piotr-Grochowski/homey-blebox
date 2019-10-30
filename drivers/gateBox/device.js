const Homey = require('homey');
const util = require('/lib/util.js');

module.exports = class gateBoxDevice extends Homey.Device {

	// Device init
	onInit() {
	
		// Enable device polling
		this.pollDevice(this.getSetting('poll_interval'));

		// register a capability listener
		this.registerCapabilityListener('button', this.onCapabilityButton.bind(this));
	}

	// Cancel pooling when device is deleted
	onDeleted() {
		clearInterval(this.pollingInterval);
		clearInterval(this.pingInterval);
	}

	// this method is called when the Device has requested a state change (button pressed)
	async onCapabilityButton( value, opts ) {

		// send a command to primary output
		util.sendGetCommand('/s/p',this.getSetting('address'))
		.catch(error => {
				// Error occured
				// Set the device as unavailable
				this.setUnavailable(Homey.__("device_unavailable"));
				clearInterval(this.pollingInterval);
				clearInterval(this.pingInterval);
		
				// check if device becomes available every 30s
				this.pingDevice();			
		})
	}

	async onSettings( oldSettingsObj, newSettingsObj, changedKeysArr, callback ) {
		// run when the user has changed the device's settings in Homey.
	
		clearInterval(this.pollingInterval);
    	clearInterval(this.pingInterval);
		this.pollDevice(newSettingsObj.poll_interval);
	}

	pollDevice(interval) {
		clearInterval(this.pollingInterval);
    	clearInterval(this.pingInterval);

		// Check the physical device state and update Homey's device state
		this.pollingInterval = setInterval(() => {
			// Read the device state
			util.sendGetCommand('/api/gate/state',this.getSetting('address'))
			.then(result => {
				// On success - update Homey's device state
				var state = false;
				if(result.currentPos!=0) state = true;
				
				if (state != this.getCapabilityValue('alarm_contact')) {
					this.setCapabilityValue('alarm_contact', state)
						.catch( err => {
							this.error(err);
						})
				}
			})
			.catch(error => {
				this.setUnavailable(Homey.__("device_unavailable"));
				this.pingDevice();			
			})
		}, interval);
	}

	pingDevice() {
		// This function checks every 60s if device becomes available
		clearInterval(this.pollingInterval);
		clearInterval(this.pingInterval);
	
		this.pingInterval = setInterval(() => {
			util.sendGetCommand('/api/device/state',this.getSetting('address'))
			.then(result => {
				if(result.type=='gateBox' && result.device.id==this.getData().id)
				{
			  		this.setAvailable();
			  		this.pollDevice(this.getSetting('poll_interval'));
				}
			})
			.catch(error => {
			  this.log('Device is not reachable, pinging every 60 seconds to see if it comes online again.');
			})
		}, 60000);
	  }
}