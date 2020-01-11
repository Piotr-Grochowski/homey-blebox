const Homey = require('homey');
const util = require('/lib/util.js');

module.exports = class wLightBoxDevice extends Homey.Device {


	// Device init
	onInit() {
		this.setAvailable();

		// Enable device polling
		this.pollDevice(this.getSetting('poll_interval'));

		this.setCapabilityValue('dim.brightness', 0);

		// register capability listeners
		this.registerCapabilityListener('dim.channelR', this.onCapabilityChannelR.bind(this));
		this.registerCapabilityListener('dim.channelG', this.onCapabilityChannelG.bind(this));
		this.registerCapabilityListener('dim.channelB', this.onCapabilityChannelB.bind(this));
		this.registerCapabilityListener('dim.channelW', this.onCapabilityChannelW.bind(this));
		this.registerMultipleCapabilityListener(["light_hue","light_saturation","dim.brightness"], this.onCapabilityLightHSB.bind(this));
		this.registerCapabilityListener('onoff', this.onCapabilityOnOff.bind(this));
	
	}

	// Cancel pooling when device is deleted
	onDeleted() {
		clearInterval(this.pollingInterval);
		clearInterval(this.pingInterval);
	}

	// this method is called when the Device has requested a state change (turned on or off)
	async onCapabilityOnOff( value, opts ) {

        if(value==true)
        {
			// Turn on the device
			util.sendGetCommand('/s/'+this.getSetting("on_value"),this.getSetting('address'))
			.catch(error => {
				// Error occured
				// Set the device as unavailable
				this.log(error);
				this.setUnavailable(Homey.__("device_unavailable"));
				clearInterval(this.pollingInterval);
				clearInterval(this.pingInterval);
		
				// check if device becomes available every 30s
				this.pingDevice();			
			})
		}
        else
        {
			// Turn off the device
			util.sendGetCommand('/s/00000000',this.getSetting('address'))
			.catch(error => {
				this.log(error);
				// Error occured
				// Set the device as unavailable
				this.setUnavailable(Homey.__("device_unavailable"));
				clearInterval(this.pollingInterval);
				clearInterval(this.pingInterval);

				// check if device becomes available every 60s
				this.pingDevice();			
			})
		}
	}

	// this method is called when the Device has requested a state change on hue or saturation
	async onCapabilityLightHSB( value, opts ) {
		if (typeof value.light_hue !== 'undefined') {
			var hue_value = value.light_hue;
		} else {
			var hue_value = this.getCapabilityValue('light_hue');
		}
		if (typeof value.light_saturation !== 'undefined') {
			var saturation_value = value.light_saturation;
		} else {
			var saturation_value = this.getCapabilityValue('light_saturation');
		}
		if (typeof value["dim.brightness"] !== 'undefined') {
			var dim_value = value["dim.brightness"];
		} else {
			var dim_value = this.getCapabilityValue('dim.brightness');
		}
		

		var channels = hsvToRgb(Math.round(hue_value*360), Math.round(saturation_value*100),Math.round(dim_value*100));

		var hexChannelR = channels[0].toString(16);
		var hexChannelG = channels[1].toString(16);
		var hexChannelB = channels[2].toString(16);
		var hexChannelW = Math.round(this.getCapabilityValue('dim.channelW')*255).toString(16);
		
		if(hexChannelR.length==1) hexChannelR = '0'+hexChannelR;
		if(hexChannelG.length==1) hexChannelG = '0'+hexChannelG;
		if(hexChannelB.length==1) hexChannelB = '0'+hexChannelB;
		if(hexChannelW.length==1) hexChannelW = '0'+hexChannelW;

		// Change the color
		util.sendGetCommand('/s/'+hexChannelR+hexChannelG+hexChannelB+hexChannelW,this.getSetting('address'))
		.catch(error => {
			// Error occured
			// Set the device as unavailable
			this.log(error);
			this.setUnavailable(Homey.__("device_unavailable"));
			clearInterval(this.pollingInterval);
			clearInterval(this.pingInterval);
	
			// check if device becomes available every 60s
			this.pingDevice();			
		})
	}


	// this method is called when the Device has requested a state change on channel R
	async onCapabilityChannelR( value, opts ) {
		var hexChannelR = Math.round(value*255).toString(16);
		var hexChannelG = Math.round(this.getCapabilityValue('dim.channelG')*255).toString(16);
		var hexChannelB = Math.round(this.getCapabilityValue('dim.channelB')*255).toString(16);
		var hexChannelW = Math.round(this.getCapabilityValue('dim.channelW')*255).toString(16);
		
		if(hexChannelR.length==1) hexChannelR = '0'+hexChannelR;
		if(hexChannelG.length==1) hexChannelG = '0'+hexChannelG;
		if(hexChannelB.length==1) hexChannelB = '0'+hexChannelB;
		if(hexChannelW.length==1) hexChannelW = '0'+hexChannelW;

		// Change the color
		util.sendGetCommand('/s/'+hexChannelR+hexChannelG+hexChannelB+hexChannelW,this.getSetting('address'))
		.catch(error => {
			// Error occured
			// Set the device as unavailable
			this.log(error);
			this.setUnavailable(Homey.__("device_unavailable"));
			clearInterval(this.pollingInterval);
			clearInterval(this.pingInterval);
	
			// check if device becomes available every 60s
			this.pingDevice();			
		})
	}

	// this method is called when the Device has requested a state change on channel G
	async onCapabilityChannelG( value, opts ) {
	var hexChannelR = Math.round(this.getCapabilityValue('dim.channelR')*255).toString(16);
	var hexChannelG = Math.round(value*255).toString(16);
	var hexChannelB = Math.round(this.getCapabilityValue('dim.channelB')*255).toString(16);
	var hexChannelW = Math.round(this.getCapabilityValue('dim.channelW')*255).toString(16);
	
	if(hexChannelR.length==1) hexChannelR = '0'+hexChannelR;
	if(hexChannelG.length==1) hexChannelG = '0'+hexChannelG;
	if(hexChannelB.length==1) hexChannelB = '0'+hexChannelB;
	if(hexChannelW.length==1) hexChannelW = '0'+hexChannelW;

	// Change the color
	util.sendGetCommand('/s/'+hexChannelR+hexChannelG+hexChannelB+hexChannelW,this.getSetting('address'))
	.catch(error => {
		// Error occured
		// Set the device as unavailable
		this.log(error);
		this.setUnavailable(Homey.__("device_unavailable"));
		clearInterval(this.pollingInterval);
		clearInterval(this.pingInterval);

		// check if device becomes available every 60s
		this.pingDevice();			
	})
}

	// this method is called when the Device has requested a state change on channel B
	async onCapabilityChannelB( value, opts ) {
		var hexChannelR = Math.round(this.getCapabilityValue('dim.channelR')*255).toString(16);
		var hexChannelG = Math.round(this.getCapabilityValue('dim.channelG')*255).toString(16);
		var hexChannelB = Math.round(value*255).toString(16);
		var hexChannelW = Math.round(this.getCapabilityValue('dim.channelW')*255).toString(16);
		
		if(hexChannelR.length==1) hexChannelR = '0'+hexChannelR;
		if(hexChannelG.length==1) hexChannelG = '0'+hexChannelG;
		if(hexChannelB.length==1) hexChannelB = '0'+hexChannelB;
		if(hexChannelW.length==1) hexChannelW = '0'+hexChannelW;

		// Change the color
		util.sendGetCommand('/s/'+hexChannelR+hexChannelG+hexChannelB+hexChannelW,this.getSetting('address'))
		.catch(error => {
			// Error occured
			// Set the device as unavailable
			this.log(error);
			this.setUnavailable(Homey.__("device_unavailable"));
			clearInterval(this.pollingInterval);
			clearInterval(this.pingInterval);
	
			// check if device becomes available every 60s
			this.pingDevice();			
		})
	}

	// this method is called when the Device has requested a state change on channel W
	async onCapabilityChannelW( value, opts ) {
		var hexChannelR = Math.round(this.getCapabilityValue('dim.channelR')*255).toString(16);
		var hexChannelG = Math.round(this.getCapabilityValue('dim.channelG')*255).toString(16);
		var hexChannelB = Math.round(this.getCapabilityValue('dim.channelB')*255).toString(16);
		var hexChannelW = Math.round(value*255).toString(16);
		
		if(hexChannelR.length==1) hexChannelR = '0'+hexChannelR;
		if(hexChannelG.length==1) hexChannelG = '0'+hexChannelG;
		if(hexChannelB.length==1) hexChannelB = '0'+hexChannelB;
		if(hexChannelW.length==1) hexChannelW = '0'+hexChannelW;

		// Change the color
		util.sendGetCommand('/s/'+hexChannelR+hexChannelG+hexChannelB+hexChannelW,this.getSetting('address'))
		.catch(error => {
			// Error occured
			// Set the device as unavailable
			this.log(error);
			this.setUnavailable(Homey.__("device_unavailable"));
			clearInterval(this.pollingInterval);
			clearInterval(this.pingInterval);
	
			// check if device becomes available every 60s
			this.pingDevice();			
		})
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
			util.sendGetCommand('/api/rgbw/state',this.getSetting('address'))
			.then(result => {
				// On success - update Homey's device state
				var levelR = Math.round(parseInt(result.rgbw.desiredColor.substring(0,2),16)/255*100)/100;
				var levelG = Math.round(parseInt(result.rgbw.desiredColor.substring(2,4),16)/255*100)/100;
				var levelB = Math.round(parseInt(result.rgbw.desiredColor.substring(4,6),16)/255*100)/100;
				var levelW = Math.round(parseInt(result.rgbw.desiredColor.substring(6,8),16)/255*100)/100;

				var onState = false;
				if(levelR>0 || levelG>0 || levelB>0 || levelW > 0)
				{
					onState = true;
				}

				var channels = rgbToHsv(parseInt(result.rgbw.desiredColor.substring(0,2),16),
										parseInt(result.rgbw.desiredColor.substring(2,4),16),
										parseInt(result.rgbw.desiredColor.substring(4,6),16));
				var hue = channels[0];
				var saturation = channels[1];
				var brightness = channels[2];

				if (levelR != this.getCapabilityValue('dim.channelR')) {
					this.setCapabilityValue('dim.channelR', levelR)
						.catch( err => {
							this.error(err);
						})
				}

				if (levelG != this.getCapabilityValue('dim.channelG')) {
					this.setCapabilityValue('dim.channelG', levelG)
						.catch( err => {
							this.error(err);
						})
				}
				if (levelB != this.getCapabilityValue('dim.channelB')) {
					this.setCapabilityValue('dim.channelB', levelB)
						.catch( err => {
							this.error(err);
						})
				}
				if (levelW != this.getCapabilityValue('dim.channelW')) {
					this.setCapabilityValue('dim.channelW', levelW)
						.catch( err => {
							this.error(err);
						})
				}

				if (brightness != this.getCapabilityValue('dim.brightness')) {
					this.setCapabilityValue('dim.brightness', brightness)
						.catch( err => {
							this.error(err);
						})
				}

				if (hue != this.getCapabilityValue('light_hue')) {
					this.setCapabilityValue('light_hue', hue)
						.catch( err => {
							this.error(err);
						})
				}

				if (saturation != this.getCapabilityValue('light_saturation')) {
					this.setCapabilityValue('light_saturation', saturation)
						.catch( err => {
							this.error(err);
						})
				}

				if (onState != this.getCapabilityValue('onoff')) {
					this.setCapabilityValue('onoff', onState)
						.catch( err => {
							this.error(err);
						})
				}
				
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
			util.sendGetCommand('/api/device/state',this.getSetting('address'))
			.then(result => {
				if(result.type=='wLightBox' && result.id==this.getData().id)
				{
			  		this.setAvailable();
			  		this.pollDevice(this.getSetting('poll_interval'));
				}
			})
			.catch(error => {
			  this.log('Device is not reachable, pinging every 60 seconds to see if it comes online again.');
			})
		}, 60000);
	  }
}

function hsvToRgb(h, s, v) {
    var r, g, b;
    var i;
    var f, p, q, t;

    // Make sure our arguments stay in-range
    h = Math.max(0, Math.min(360, h));
    s = Math.max(0, Math.min(100, s));
    v = Math.max(0, Math.min(100, v));

    // We accept saturation and value arguments from 0 to 100 because that's
    // how Photoshop represents those values. Internally, however, the
    // saturation and value are calculated from a range of 0 to 1. We make
    // That conversion here.
    s /= 100;
    v /= 100;

    if(s == 0) {
        // Achromatic (grey)
        r = g = b = v;
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    h /= 60; // sector 0 to 5
    i = Math.floor(h);
    f = h - i; // factorial part of h
    p = v * (1 - s);
    q = v * (1 - s * f);
    t = v * (1 - s * (1 - f));

    switch(i) {
        case 0:
            r = v;
            g = t;
            b = p;
            break;

        case 1:
            r = q;
            g = v;
            b = p;
            break;

        case 2:
            r = p;
            g = v;
            b = t;
            break;

        case 3:
            r = p;
            g = q;
            b = v;
            break;

        case 4:
            r = t;
            g = p;
            b = v;
            break;

        default: // case 5:
            r = v;
            g = p;
            b = q;
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function rgbToHsv(r, g, b) {
	r /= 255, g /= 255, b /= 255;
  
	var max = Math.max(r, g, b), min = Math.min(r, g, b);
	var h, s, v = max;
  
	var d = max - min;
	s = max == 0 ? 0 : d / max;
  
	if (max == min) {
	  h = 0; // achromatic
	} else {
	  switch (max) {
		case r: h = (g - b) / d + (g < b ? 6 : 0); break;
		case g: h = (b - r) / d + 2; break;
		case b: h = (r - g) / d + 4; break;
	  }
  
	  h /= 6;
	}
  
	return [ h, s, v ];
  }