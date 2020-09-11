const Homey = require('homey');
const util = require('/lib/util.js');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = class switchBoxDevice extends Homey.Device {

	// Device init
	onInit() {
		this.setAvailable();

		this.addListener('poll', this.pollDevice);
		this.addListener('ping', this.pingDevice);

		// register a capability listener
		this.registerCapabilityListener('onoff', this.onCapabilityOnoff.bind(this));

		util.sendGetCommand('/info',this.getSetting('address'))
		.then(result => {
			if(result.device.type=='switchBox' && result.device.id==this.getData().id)
			{
				if(result.device.apiLevel=='20200229')
				{
					this.setSettings({
						product: result.device.product,
						hv: result.device.hv,
						fv: result.device.fv,
						apiLevel: result.device.apiLevel
					});
					this.polling = true;
					this.pinging = false;
							
					// Enable device polling
					this.emit('poll');

				}
				else
				{
					this.log('Device API level is not supported. Expected: 20200229, installed: '+result.device.apiLevel);
					this.polling = false;
					this.pinging = true;

					// Enable device pinging
					this.emit('ping');
				}
			}
		})
		.catch(error => {
			this.log('Device is not reachable, pinging every 60 seconds to see if it comes online again.');
			this.polling = false;
			this.pinging = true;
			// Enable device pinging
			this.emit('ping');
		})

	}

	async pollDevice() 
	{
		while (this.polling && !this.pinging) {
			// Read the device state
			await util.sendGetCommand('/state',this.getSetting('address'))
			.then(result => {
				// On success - update Homey's device state
				this.setAvailable();
				let state = false;
				if(result.relays[0].state==1) state = true;
				
				if (state != this.getCapabilityValue('onoff')) {
					this.setCapabilityValue('onoff', state)
						.catch( err => {
							this.error(err);
						})
					
					let tokens = {};
				    let states = {};

					this._driver = this.getDriver();
					if(state==false)
					{
	    				this._driver.ready(() => {
								this._driver.triggerTurnedOffFromOutside( this, tokens, states );
							});
					}
					else
					{
	    				this._driver.ready(() => {
								this._driver.triggerTurnedOnFromOutside( this, tokens, states );
							});
					}
    				
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
			await util.sendGetCommand('/info',this.getSetting('address'))
			.then(result => {
				if(result.device.type=='switchBox' && result.device.id==this.getData().id)
				{
					if(result.device.apiLevel=='20200229')
					{
						this.setSettings({
							product: result.device.product,
							hv: result.device.hv,
							fv: result.device.fv,
							apiLevel: result.device.apiLevel
						});
	
						this.setAvailable();
						this.polling = true;
						this.pinging = false;
						this.emit('poll');
						return;
					}
					else
					{
						this.log('Device API level is not supported. Expected: 20200229, installed: '+result.device.apiLevel);
					}
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
			// Turn on the device
			util.sendGetCommand('/s/1',this.getSetting('address'))
			.catch(error => {
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
				this.polling = false;
				this.pinging = true;
				this.emit('ping');
			})
		}
	}

}