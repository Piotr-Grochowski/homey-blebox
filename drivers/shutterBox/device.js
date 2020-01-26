const Homey = require('homey');
const util = require('/lib/util.js');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = class switchBoxDevice extends Homey.Device {

	// Device init
	onInit() {
		this.setAvailable();

		this.polling = true;
		this.pinging = false;

		this.addListener('poll', this.pollDevice);
		this.addListener('ping', this.pingDevice);

		// register a capability listener
		this.registerCapabilityListener('windowcoverings_state', this.onCapabilityState.bind(this));
		this.registerCapabilityListener('windowcoverings_tilt_set', this.onCapabilityTiltSet.bind(this));
		this.registerCapabilityListener('windowcoverings_set', this.onCapabilityPositionSet.bind(this));
		this.registerCapabilityListener('windowcoverings_closed', this.onCapabilityClosed.bind(this));

		// Enable device polling
		this.emit('poll');
	}

	async pollDevice() 
	{
		while (this.polling && !this.pinging) {
			await util.sendGetCommand('/api/shutter/state',this.getSetting('address'))
			.then(result => {
				// On success - update Homey's device state
				this.setAvailable();
				let shutter_state = 'idle';
				let shutter_closed = false;
				let shutter_position = result.desiredPos.position/100;
				let shutter_tilt = result.desiredPos.tilt/100;
	
				if(result.state == 1) 
				{
					shutter_state = "up";
				}
				if(result.state == 0) 
				{
					shutter_state = "down";
				}
				if(result.state == 3)
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
				if(result.type=='shutterBox' && result.id==this.getData().id)
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

	// this method is called when the Device has requested a state change (turned up or down)
	async onCapabilityState( value, opts ) {

        if(value=='up')
        {
			// Move device up
			util.sendGetCommand('/s/u',this.getSetting('address'))
			.catch(error => {
				// Error occured
				// Set the device as unavailable
				this.log(error);
				this.polling = false;
				this.pinging = true;
				this.emit('ping');
			})
		}

        if(value=='down')
        {
			// Move device up
			util.sendGetCommand('/s/d',this.getSetting('address'))
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

	// this method is called when the Device has requested a tilt change
	async onCapabilityTiltSet( value, opts ) {

		// Tilt
		var tiltValue = Math.round(value*100).toString();

		util.sendGetCommand('/s/t/'+tiltValue,this.getSetting('address'))
		.catch(error => {
			// Error occured
			// Set the device as unavailable
			this.log(error);
			this.polling = false;
			this.pinging = true;
			this.emit('ping');
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
			this.log(error);
			this.polling = false;
			this.pinging = true;
			this.emit('ping');
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
			this.log(error);
			this.polling = false;
			this.pinging = true;
			this.emit('ping');
		})

	}
}