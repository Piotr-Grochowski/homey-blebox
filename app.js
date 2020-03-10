'use strict';
const util = require('/lib/util.js');

const Homey = require('homey');

class BleBoxApp extends Homey.App {
	
	onInit() {
		this.log('BleBox is running...');
	
		let dimWhiteAction = new Homey.FlowCardAction('dim_white');
		let dimRedAction = new Homey.FlowCardAction('dim_red');
		let dimGreenAction = new Homey.FlowCardAction('dim_green');
		let dimBlueAction = new Homey.FlowCardAction('dim_blue');
		let setChannelsAction = new Homey.FlowCardAction('set_channels');
		let moveToFavoritePosition = new Homey.FlowCardAction('move_to_favorite_pos');

		moveToFavoritePosition
		  .register()
		  .registerRunListener(( args, state ) => {

			var addr = args.my_device.getSetting('address');
			return util.sendGetCommand('/s/f',args.my_device.getSetting('address'));
		});


		dimWhiteAction
		  .register()
		  .registerRunListener(( args, state ) => {

			var hexChannelR = Math.round(args.my_device.getCapabilityValue('dim.channelR')*255).toString(16);
			var hexChannelG = Math.round(args.my_device.getCapabilityValue('dim.channelG')*255).toString(16);
			var hexChannelB = Math.round(args.my_device.getCapabilityValue('dim.channelB')*255).toString(16);
			var hexChannelW = Math.round(args.brightness*255).toString(16);
			var addr = args.my_device.getSetting('address');

			if(hexChannelR.length==1) hexChannelR = '0'+hexChannelR;
			if(hexChannelG.length==1) hexChannelG = '0'+hexChannelG;
			if(hexChannelB.length==1) hexChannelB = '0'+hexChannelB;
			if(hexChannelW.length==1) hexChannelW = '0'+hexChannelW;

			// Change the color
			return util.sendGetCommand('/s/'+hexChannelR+hexChannelG+hexChannelB+hexChannelW,addr)
		
		  });

		  dimRedAction
		  .register()
		  .registerRunListener(( args, state ) => {

			var hexChannelW = Math.round(args.my_device.getCapabilityValue('dim.channelW')*255).toString(16);
			var hexChannelG = Math.round(args.my_device.getCapabilityValue('dim.channelG')*255).toString(16);
			var hexChannelB = Math.round(args.my_device.getCapabilityValue('dim.channelB')*255).toString(16);
			var hexChannelR = Math.round(args.brightness*255).toString(16);
			var addr = args.my_device.getSetting('address');

			if(hexChannelR.length==1) hexChannelR = '0'+hexChannelR;
			if(hexChannelG.length==1) hexChannelG = '0'+hexChannelG;
			if(hexChannelB.length==1) hexChannelB = '0'+hexChannelB;
			if(hexChannelW.length==1) hexChannelW = '0'+hexChannelW;

			// Change the color
			return util.sendGetCommand('/s/'+hexChannelR+hexChannelG+hexChannelB+hexChannelW,addr)
		
		  });

		  dimGreenAction
		  .register()
		  .registerRunListener(( args, state ) => {

			var hexChannelR = Math.round(args.my_device.getCapabilityValue('dim.channelR')*255).toString(16);
			var hexChannelW = Math.round(args.my_device.getCapabilityValue('dim.channelW')*255).toString(16);
			var hexChannelB = Math.round(args.my_device.getCapabilityValue('dim.channelB')*255).toString(16);
			var hexChannelG = Math.round(args.brightness*255).toString(16);
			var addr = args.my_device.getSetting('address');

			if(hexChannelR.length==1) hexChannelR = '0'+hexChannelR;
			if(hexChannelG.length==1) hexChannelG = '0'+hexChannelG;
			if(hexChannelB.length==1) hexChannelB = '0'+hexChannelB;
			if(hexChannelW.length==1) hexChannelW = '0'+hexChannelW;

			// Change the color
			return util.sendGetCommand('/s/'+hexChannelR+hexChannelG+hexChannelB+hexChannelW,addr)
		
		  });

		  dimBlueAction
		  .register()
		  .registerRunListener(( args, state ) => {

			var hexChannelR = Math.round(args.my_device.getCapabilityValue('dim.channelR')*255).toString(16);
			var hexChannelG = Math.round(args.my_device.getCapabilityValue('dim.channelG')*255).toString(16);
			var hexChannelW = Math.round(args.my_device.getCapabilityValue('dim.channelW')*255).toString(16);
			var hexChannelB = Math.round(args.brightness*255).toString(16);
			var addr = args.my_device.getSetting('address');

			if(hexChannelR.length==1) hexChannelR = '0'+hexChannelR;
			if(hexChannelG.length==1) hexChannelG = '0'+hexChannelG;
			if(hexChannelB.length==1) hexChannelB = '0'+hexChannelB;
			if(hexChannelW.length==1) hexChannelW = '0'+hexChannelW;

			// Change the color
			return util.sendGetCommand('/s/'+hexChannelR+hexChannelG+hexChannelB+hexChannelW,addr)
		
		  });

		  setChannelsAction
		  .register()
		  .registerRunListener(( args, state ) => {

			var hexChannelR = Math.round(args.red_channel*255).toString(16);
			var hexChannelG = Math.round(args.green_channel*255).toString(16);
			var hexChannelB = Math.round(args.blue_channel*255).toString(16);
			var hexChannelW = Math.round(args.white_channel*255).toString(16);
			var addr = args.my_device.getSetting('address');

			if(hexChannelR.length==1) hexChannelR = '0'+hexChannelR;
			if(hexChannelG.length==1) hexChannelG = '0'+hexChannelG;
			if(hexChannelB.length==1) hexChannelB = '0'+hexChannelB;
			if(hexChannelW.length==1) hexChannelW = '0'+hexChannelW;

			// Change the color
			return util.sendGetCommand('/s/'+hexChannelR+hexChannelG+hexChannelB+hexChannelW,addr)
		
		  });

	}
	
}

module.exports = BleBoxApp;