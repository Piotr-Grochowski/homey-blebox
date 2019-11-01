const Homey = require('homey');
const util = require('/lib/util.js');


module.exports = class gateBoxDriver extends Homey.Driver {

	onPair( socket ) {
		// called when a user presses Connect on the UI
		socket.on('addBleBox', function( data, callback ) {
			
			// Check if this is a real switchBox
			util.sendGetCommand('/api/device/state',data.ip)
			.then(result => {
				if(result.type=='gateBox')
				{
					// Retrieve device data
					var device_data = {
						id: result.id,
						name: result.deviceName,
						address : data.ip,
						poll_interval: 1000
					};
					// and pass it back to UI
					callback(null,device_data);		
				}
				else
				{
					// if the device is of wrong type
					callback(new Error(Homey.__("wrong_device_type")+result.type),null)
				}
			})
			.catch(error => {
				// if an error occured
			  	callback(error,null);
			})
		});
	  }
}