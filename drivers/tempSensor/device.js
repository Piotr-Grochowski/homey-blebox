const Homey = require('homey');
const util = require('/lib/util.js');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = class airSensorDevice extends Homey.Device {


	// Device init
	onInit() {
		this.setAvailable();

		this.polling = true;
		this.pinging = false;

		this.addListener('poll', this.pollDevice);
		this.addListener('ping', this.pingDevice);

		// Read the device state
		util.sendGetCommand('/api/tempsensor/state',this.getSetting('address'))
		.then(result => {
			let temperature = 0.00;

			result.tempSensor.sensors.forEach(element => {
				if(element.type=='temperature') temperature = element.value/100;
			});

			this.setCapabilityValue('measure_temperature', temperature)
				.catch( err => {
					this.error(err);
				});

			// Enable device polling
			this.emit('poll');
		})
		.catch(error => {
			console.log(error);
			this.polling = false;
			this.pinging = true;
			this.emit('ping');
			return;
		});	
	}

	async pollDevice() 
	{
		while (this.polling && !this.pinging) {
			await util.sendGetCommand('/api/tempsensor/state',this.getSetting('address'))
			.then(result => {
				this.setAvailable();
				let temperature = 0.00;
	
				result.tempSensor.sensors.forEach(element => {
					if(element.type=='temperature') temperature = element.value/100;
				});
	
				this.setCapabilityValue('measure_temperature', temperature)
					.catch( err => {
						this.error(err);
					});
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
				if(result.device.type=='tempSensor' && result.device.id==this.getData().id)
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
}