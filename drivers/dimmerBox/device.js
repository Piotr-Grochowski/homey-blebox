const Homey = require('homey');
const util = require('/lib/util.js');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = class dimmerBoxDevice extends Homey.Device {

	// Device init
	onInit() {
		this.setAvailable();
		
		this.polling = true;
		this.pinging = false;

		this.addListener('poll', this.pollDevice);
		this.addListener('ping', this.pingDevice);

		// Stores last Dim Level > 0. In the beginning it's 100%
		this.previousDimLevel = 100;

		// register capability listeners
		this.registerCapabilityListener('onoff', this.onCapabilityOnoff.bind(this));
		this.registerCapabilityListener('dim', this.onCapabilityDim.bind(this));

		// Enable device polling
		this.emit('poll');
	}

	async pollDevice() 
	{
		while (this.polling && !this.pinging) {
			await util.sendGetCommand('/api/dimmer/state',this.getSetting('address'))
			.then(result => {
				// On success - update Homey's device state
				this.setAvailable();
				let brightness = Math.round(result.dimmer.desiredBrightness/255*100)/100;
				let onState = false;
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
			await util.sendGetCommand('/api/device/state',this.getSetting('address'))
			.then(result => {
				if(result.device.type=='dimmerBox' && result.device.id==this.getData().id)
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
				this.polling = false;
				this.pinging = true;
				this.emit('ping');
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
				this.polling = false;
				this.pinging = true;
				this.emit('ping');

			})
		}
	}

	// this method is called when the Device has requested a state change (turned on or off)
	async onCapabilityDim( value, opts ) {

		let hexBrightness = Math.round(value*255).toString(16);

		// Dim the device
		util.sendGetCommand('/s/'+hexBrightness,this.getSetting('address'))
		.catch(error => {
			// Error occured
			// Set the device as unavailable
			this.polling = false;
			this.pinging = true;
			this.emit('ping');
		})
	}

/*
	async onSettings( oldSettingsObj, newSettingsObj, changedKeysArr, callback ) {
		// run when the user has changed the device's settings in Homey.
		this.pinging = false;
		this.polling = true;
		this.emit('poll');
	}
*/
}