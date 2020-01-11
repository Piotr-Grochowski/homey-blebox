const Homey = require('homey');
const util = require('/lib/util.js');

module.exports = class switchBoxDDevice extends Homey.Device {

	// Device init
	onInit() {
		this.setAvailable();

		// Enable device polling
		this.pollDevice(this.getSetting('poll_interval'));

		// register a capability listener
		this.registerCapabilityListener('onoff.relay1', this.onCapabilityOnoff1.bind(this));
		this.registerCapabilityListener('onoff.relay2', this.onCapabilityOnoff2.bind(this));
	}

	// Cancel pooling when device is deleted
	onDeleted() {
		clearInterval(this.pollingInterval);
		clearInterval(this.pingInterval);
	}

	// this method is called when the Device has requested a state change (turned on or off)
	async onCapabilityOnoff1( value, opts ) {

        if(value==true)
        {
			// Turn on the device
			util.sendGetCommand('/s/0/1',this.getSetting('address'))
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
        else
        {
			// Turn off the device
			util.sendGetCommand('/s/0/0',this.getSetting('address'))
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
	}

	// this method is called when the Device has requested a state change (turned on or off)
	async onCapabilityOnoff2( value, opts ) {

		if(value==true)
		{
			// Turn on the device
			util.sendGetCommand('/s/1/1',this.getSetting('address'))
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
		else
		{
			// Turn off the device
			util.sendGetCommand('/s/1/0',this.getSetting('address'))
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
			util.sendGetCommand('/api/relay/state',this.getSetting('address'))
			.then(result => {
				// On success - update Homey's device state
				var state1 = false;
				var state2 = false;

				if(result.relays[0].state==1) state1 = true;
				if(result.relays[1].state==1) state2 = true;
				
				if (state1 != this.getCapabilityValue('onoff.relay1')) {
					this.setCapabilityValue('onoff.relay1', state1)
						.catch( err => {
							this.error(err);
						})
				}

				if (state2 != this.getCapabilityValue('onoff.relay2')) {
					this.setCapabilityValue('onoff.relay2', state2)
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
				if(result.device.type=='switchBoxD' && result.device.id==this.getData().id)
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