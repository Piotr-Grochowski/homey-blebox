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
		util.sendGetCommand('/api/air/state',this.getSetting('address'))
		.then(result => {
			let pm1value = 0;
			let pm25value = 0;
			let pm10value = 0;

			result.air.sensors.forEach(element => {
				if(element.type=='pm1') pm1value = element.value;
				if(element.type=='pm2.5') pm25value = element.value;
				if(element.type=='pm10') pm10value = element.value;
			});

			this.setCapabilityValue('measure_pm25', pm25value)
				.catch( err => {
					this.error(err);
				});

			this.setCapabilityValue('measure_pm1', pm1value)
				.catch( err => {
					this.error(err);
				});

			this.setCapabilityValue('measure_pm10', pm10value)
				.catch( err => {
					this.error(err);
				});


			// Enable device polling
				this.polling = true;
				this.pinging = false;
				this.emit('poll');
		})
		.catch(error => {
			this.polling = false;
			this.pinging = true;
			this.emit('ping');
	});	

	}

	async pollDevice() 
	{
		while (this.polling && !this.pinging) {
			// Read the device state
			await util.sendGetCommand('/api/air/state',this.getSetting('address'))
			.then(result => {
				this.setAvailable();

				let pm1value = 0;
				let pm25value = 0;
				let pm10value = 0;

				result.air.sensors.forEach(element => {
					if(element.type=='pm1') pm1value = element.value;
					if(element.type=='pm2.5') pm25value = element.value;
					if(element.type=='pm10') pm10value = element.value;
				});

				this.setCapabilityValue('measure_pm25', pm25value)
					.catch( err => {
						this.error(err);
					});

				this.setCapabilityValue('measure_pm1', pm1value)
					.catch( err => {
						this.error(err);
					});

				this.setCapabilityValue('measure_pm10', pm10value)
					.catch( err => {
						this.error(err);
					});
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
				if(result.type=='airSensor' && result.device.id==this.getData().id)
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