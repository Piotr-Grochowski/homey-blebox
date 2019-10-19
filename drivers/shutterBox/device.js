const Homey = require('homey');
const util = require('/lib/util.js');

module.exports = class switchBoxDevice extends Homey.Device {

	// Device init
	onInit() {
		// Enable device polling
		this.pollDevice(this.getSetting('poll_interval'));

		// register a capability listener
		this.registerCapabilityListener('windowcoverings_state', this.onCapabilityState.bind(this));
		this.registerCapabilityListener('windowcoverings_tilt_set', this.onCapabilityTiltSet.bind(this));
		this.registerCapabilityListener('windowcoverings_set', this.onCapabilityPositionSet.bind(this));
		this.registerCapabilityListener('windowcoverings_closed', this.onCapabilityClosed.bind(this));
	}

	// Cancel pooling when device is deleted
	onDeleted() {
		clearInterval(this.pollingInterval);
		clearInterval(this.pingInterval);
	}

	// this method is called when the Device has requested a state change (turned up or down)
	async onCapabilityState( value, opts ) {

        if(value=='up')
        {
			// Move device up
			util.sendGetCommand('/s/u',this.getSetting('address'))
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

        if(value=='down')
        {
			// Move device up
			util.sendGetCommand('/s/d',this.getSetting('address'))
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

	// this method is called when the Device has requested a tilt change
	async onCapabilityTiltSet( value, opts ) {

		// Tilt
		var tiltValue = Math.round(value*100).toString();

		util.sendGetCommand('/s/t/'+tiltValue,this.getSetting('address'))
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

	// this method is called when the Device has requested a position change
	async onCapabilityPositionSet( value, opts ) {

		// Change position
		var posValue = Math.round(value*100).toString();

		util.sendGetCommand('/s/p/'+posValue,this.getSetting('address'))
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

	// this method is called when the Device has requested to close
	async onCapabilityClosed( value, opts ) {

		// Change position
		var posValue = Math.round(value*100).toString();

		util.sendGetCommand('/s/d',this.getSetting('address'))
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
			util.sendGetCommand('/api/shutter/state',this.getSetting('address'))
			.then(result => {
				// On success - update Homey's device state
				var shutter_state = 'idle';
				var shutter_closed = false;
				var shutter_position = result.desiredPos.position/100;
				var shutter_tilt = result.desiredPos.tilt/100;

				if(result.shutter.state == 1) 
				{
					shutter_state = "up";
				}
				if(result.shutter.state == 0) 
				{
					shutter_state = "down";
				}
				if(result.shutter.state == 3)
				{
					shutter_closed = true;
				}
				
				if (shutter_state != this.getCapabilityValue('windowcoverings_state')) {
					this.setCapabilityValue('windowcoverings_state', shutter_state)
						.catch( err => {
							this.error(err);
						})
				}

				if (shutter_closed != this.getCapabilityValue('windowcoverings_closed')) {
					this.setCapabilityValue('windowcoverings_closed', shutter_closed)
						.catch( err => {
							this.error(err);
						})
				}

				if (shutter_position != this.getCapabilityValue('windowcoverings_set')) {
					this.setCapabilityValue('windowcoverings_set', shutter_position)
						.catch( err => {
							this.error(err);
						})
				}

				if (shutter_tilt != this.getCapabilityValue('windowcoverings_tilt_set')) {
					this.setCapabilityValue('windowcoverings_tilt_set', shutter_tilt)
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
				if(result.device.type=='shutterBox' && result.device.id==this.getData().id)
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