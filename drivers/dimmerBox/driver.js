const Homey = require('homey');
const util = require('/lib/util.js');


module.exports = class dimmerBoxDriver extends Homey.Driver {
	
	onInit() {

		this._flowTriggerTurnedOnFromOutside = new Homey.FlowCardTriggerDevice('dimmerbox_turned_on_from_outside')
		  .register()
	
		  this._flowTriggerTurnedOffFromOutside = new Homey.FlowCardTriggerDevice('dimmerbox_turned_off_from_outside')
		  .register()
	}
	
	triggerTurnedOnFromOutside( device, tokens, state ) {
		this._flowTriggerTurnedOnFromOutside
		  .trigger( device, tokens, state )
			.then( )
			.catch( this.error )
	}

	triggerTurnedOffFromOutside( device, tokens, state ) {
		this._flowTriggerTurnedOffFromOutside
		  .trigger( device, tokens, state )
			.then( )
			.catch( this.error )
	}

	onPair( socket ) {
		// called when a user presses Connect on the UI
		socket.on('addBleBox', function( data, callback ) {
			
			// Check if this is a real switchBox
			util.sendGetCommand('/api/device/state',data.ip)
			.then(result => {
				if(result.device.type=='dimmerBox')
				{
					// Retrieve device data
					var device_data = {
						id: result.device.id,
						name: result.device.deviceName,
						address : data.ip,
						poll_interval: 1000,
						product: result.device.type,
						hv: result.device.hv,
						fv: result.device.fv
					};
					// and pass it back to UI
					callback(null,device_data);		
				}
				else
				{
					// if the device is of wrong type
					callback(new Error(Homey.__("wrong_device_type")+result.device.type),null)
				}
			})
			.catch(error => {
				// if an error occured
			  	callback(error,null);
			})
		});
	  }
}