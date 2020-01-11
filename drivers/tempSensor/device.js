const Homey = require('homey');
const util = require('/lib/util.js');

module.exports = class airSensorDevice extends Homey.Device {


	// Device init
	onInit() {
		this.setAvailable();

		// Read the device state
		util.sendGetCommand('/api/tempsensor/state',this.getSetting('address'))
		.then(result => {
			var temperature = 0.00;

			result.tempSensor.sensors.forEach(element => {
				if(element.type=='temperature') temperature = element.value/100;
			});

			this.setCapabilityValue('measure_temperature', temperature)
				.catch( err => {
					this.error(err);
				});

			// Enable device polling
			this.pollDevice(this.getSetting('poll_interval'));
		})
		.catch(error => {
			this.setUnavailable(Homey.__("device_unavailable"));
			this.pingDevice();			
		});	

	}

	// Cancel pooling when device is deleted
	onDeleted() {
		clearInterval(this.pollingInterval);
		clearInterval(this.pingInterval);
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
			util.sendGetCommand('/api/tempsensor/state',this.getSetting('address'))
			.then(result => {
				var temperature = 0.00;

				result.tempSensor.sensors.forEach(element => {
					if(element.type=='temperature') temperature = element.value/100;
				});
	
				this.setCapabilityValue('measure_temperature', temperature)
					.catch( err => {
						this.error(err);
					});
	
		
				
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
			clearInterval(this.pingInterval);
			util.sendGetCommand('/api/device/state',this.getSetting('address'))
			.then(result => {
				if(result.device.type=='tempSensor' && result.device.id==this.getData().id)
				{
					this.setAvailable();
					this.pollDevice(this.getSetting('poll_interval'));
				}
			})
			.catch(error => {
			  	this.log('Device is not reachable, pinging every 60 seconds to see if it comes online again.');
				this.pingDevice();
			})
		}, 60000);
	  }
}