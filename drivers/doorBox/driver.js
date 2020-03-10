const Homey = require('homey');
const util = require('/lib/util.js');


module.exports = class doorBoxDriver extends Homey.Driver {

	onPair( socket ) {
		// called when a user presses Connect on the UI
		socket.on('addBleBox', function( data, callback ) {
			
			// Check if this is a real switchBox
			util.sendGetCommandAuth('/api/device/state',data.ip,data.username,data.password)
			.then(result => {
				if(result.type=='gateBox')
				{
					// Retrieve device data
					var device_data = {
						id: result.id,
						name: result.deviceName,
						address : data.ip,
						poll_interval: 1000,
						user: data.username,
						pass: data.password
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