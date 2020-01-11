const Homey = require('homey');
const util = require('/lib/util.js');

module.exports = class dimmerBoxDevice extends Homey.Device {


	// Device init
	onInit() {
		this.setAvailable();

		// Stores last Dim Level > 0. In the beginning it's 100%
		this.previousDimLevel = 100;

		// Enable device polling
		this.pollDevice(this.getSetting('poll_interval'));

		// register capability listeners
		this.registerCapabilityListener('onoff', this.onCapabilityOnoff.bind(this));
		this.registerCapabilityListener('dim', this.onCapabilityDim.bind(this));
	}

	// Cancel pooling when device is deleted
	onDeleted() {
		clearInterval(this.pollingInterval);
		clearInterval(this.pingInterval);
	}

	// this method is called when the Device has requested a state change (turned on or off)
	async onCapabilityOnoff( value, opts ) {

        if(value==true)
        {
			var hexBrightness = Math.round(this.previousDimLevel*255).toString(16);
			if(this.getSetting('dimOn') != 'previous' )
			{
				hexBrightness = Math.round(this.getSetting('dimOn')*255/100).toString(16);
			}

			// Turn on the device
			util.sendGetCommand('/s/'+hexBrightness,this.getSetting('address'))
			.catch(error => {
				// Error occured
				// Set the device as unavailable
				this.log(error);
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
			util.sendGetCommand('/s/0',this.getSetting('address'))
			.catch(error => {
				this.log(error);
				// Error occured
				// Set the device as unavailable
				this.setUnavailable(Homey.__("device_unavailable"));
				clearInterval(this.pollingInterval);
				clearInterval(this.pingInterval);

				// check if device becomes available every 60s
				this.pingDevice();			
			})
		}
	}

	// this method is called when the Device has requested a state change (turned on or off)
	async onCapabilityDim( value, opts ) {

		var hexBrightness = Math.round(value*255).toString(16);

		// Dim the device
		util.sendGetCommand('/s/'+hexBrightness,this.getSetting('address'))
		.catch(error => {
			// Error occured
			// Set the device as unavailable
			this.log(error);
			this.setUnavailable(Homey.__("device_unavailable"));
			clearInterval(this.pollingInterval);
			clearInterval(this.pingInterval);
	
			// check if device becomes available every 60s
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
			util.sendGetCommand('/api/dimmer/state',this.getSetting('address'))
			.then(result => {
				// On success - update Homey's device state
				var brightness = Math.round(result.dimmer.desiredBrightness/255*100)/100;
				var onState = false;
				if(brightness>0)
				{
					this.previousDimLevel = brightness;
					onState = true;
				}
				if (brightness != this.getCapabilityValue('dim')) {
					this.setCapabilityValue('dim', brightness)
						.catch( err => {
							this.error(err);
						})
				}

				if (onState != this.getCapabilityValue('onoff')) {
					this.setCapabilityValue('onoff', onState)
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
				if(result.device.type=='dimmerBox' && result.device.id==this.getData().id)
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