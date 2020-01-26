const Homey = require('homey');
const util = require('/lib/util.js');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = class switchBoxDDevice extends Homey.Device {

	// Device init
	onInit() {
		this.setAvailable();

		this.polling = true;
		this.pinging = false;

		this.addListener('poll', this.pollDevice);
		this.addListener('ping', this.pingDevice);

		// register a capability listener
		this.registerCapabilityListener('onoff.relay1', this.onCapabilityOnoff1.bind(this));
		this.registerCapabilityListener('onoff.relay2', this.onCapabilityOnoff2.bind(this));

		// Enable device polling
		this.emit('poll');
	}

	async pollDevice() 
	{
		while (this.polling && !this.pinging) {
			await util.sendGetCommand('/api/relay/state',this.getSetting('address'))
			.then(result => {
				// On success - update Homey's device state
				this.setAvailable();
				let state1 = false;
				let state2 = false;
	
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
				console.log(error);
				this.polling = false;
				this.pinging = true;
				this.emit('ping');
				return;
			})
			await delay(this.getSetting('poll_interval'));
		}  

    }

	async pingDevice() 
	{
		while (!this.polling && this.pinging) {
			this.setUnavailable();
			await util.sendGetCommand('/api/device/state',this.getSetting('address'))
			.then(result => {
				if(result.device.type=='switchBoxD' && result.device.id==this.getData().id)
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
	async onCapabilityOnoff1( value, opts ) {

        if(value==true)
        {
			// Turn on the device
			util.sendGetCommand('/s/0/1',this.getSetting('address'))
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
			util.sendGetCommand('/s/0/0',this.getSetting('address'))
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

	// this method is called when the Device has requested a state change (turned on or off)
	async onCapabilityOnoff2( value, opts ) {

		if(value==true)
		{
			// Turn on the device
			util.sendGetCommand('/s/1/1',this.getSetting('address'))
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
			util.sendGetCommand('/s/1/0',this.getSetting('address'))
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
}