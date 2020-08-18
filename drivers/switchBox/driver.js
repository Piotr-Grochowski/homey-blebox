const Homey = require('homey');
const util = require('/lib/util.js');


module.exports = class switchBoxDriver extends Homey.Driver {

	onInit() {

		this._flowTriggerTurnedOnFromOutside = new Homey.FlowCardTriggerDevice('switchbox_turned_on_from_outside')
		  .register()
	
		  this._flowTriggerTurnedOffFromOutside = new Homey.FlowCardTriggerDevice('switchbox_turned_off_from_outside')
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
			util.sendGetCommand('/info',data.ip)
			.then(result => {
				if(result.device.type=='switchBox')
				{
					if(result.device.apiLevel=='20200229')
					{
						// Retrieve device data
						var device_data = {
							id: result.device.id,
							name: result.device.deviceName,
							address : data.ip,
							poll_interval: 1000,
							product: result.device.product,
							apiLevel: result.device.apiLevel,
							hv: result.device.hv,
							fv: result.device.fv
						};
						// and pass it back to UI
						callback(null,device_data);		
					}
					else
					{
						// if the device is of unsupported API level
						callback(new Error(Homey.__("wrong_api_level")+result.device.apiLevel+'. '+Homey.__("expected_api_level")+'20200229'),null)
					}
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