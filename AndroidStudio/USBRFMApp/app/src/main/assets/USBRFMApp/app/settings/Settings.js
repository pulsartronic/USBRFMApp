///////////////////////////////////////////////////////////////////////////////////
// Settings
let Settings = function(parent) {
	this.parent = parent;

	this.tag = document.createElement('div');
	this.tag.className = 'Settings';
	
	this.title = document.createElement('div');
	this.title.className = 'Title';
	this.title.textContent = 'Room settings';
	this.tag.append(this.title);

	this.separator = document.createElement('div');
	this.separator.className = 'Separator';
	this.tag.append(this.separator);

	this.roomid = new InputRow(this, 'room', 'text', '');
	this.tag.append(this.roomid.tag);
	this.roomid.pong('default');
	this.roomid.onchange = this.onDataChanged.bind(this);
	
	this.user = new InputRow(this, 'username', 'text', '');
	this.tag.append(this.user.tag);
	this.user.pong('no name');
	this.user.onchange = this.onDataChanged.bind(this);
	
	this.aesm = null;
};

Settings.prototype.init = function() {
	let settings = {};
	settings.app = {};
	settings.app.user = this.user.value();
	settings.app.roomid = this.roomid.value();

	try {
		let usbRFMAppSTR = localStorage.getItem('USBRFMApp') || '{}';
		let savedSettings = JSON.parse(usbRFMAppSTR);
		savedSettings.app = savedSettings.app || {};
		savedSettings.app.roomid = savedSettings.app.roomid || `default`;
		savedSettings.app.user = savedSettings.app.user || `user ${Math.floor(100000 * Math.random())}`;
		let USBRFMApp = JSON.stringify(savedSettings);
		localStorage.setItem('USBRFMApp', savedSettings);
		settings = savedSettings;
	} catch(e) {
		// window.app.rfm.console.addTextLine(e);
	}
	
	this.roomid.pong(settings.app.roomid);
	this.user.pong(settings.app.user);
	
	let key = Sha256.hash(settings.app.roomid);
	this.aesm = new AESM(key);
};

Settings.prototype.onDataChanged = function() {
	let settings = {};
	settings.app = {};
	settings.app.user = this.user.value();
	settings.app.roomid = this.roomid.value();
	
	try {
		let settingsSTR = localStorage.getItem('USBRFMApp');
		let savedSettings = JSON.parse(settingsSTR);
		savedSettings.app.roomid = settings.app.roomid;
		savedSettings.app.user = settings.app.user;
		settings = savedSettings;
	} catch(e) {
		
	}
	
	let key = Sha256.hash(settings.app.roomid);
	this.aesm = new AESM(key);
	
	try {
		let USBRFMApp = JSON.stringify(settings);
		localStorage.setItem('USBRFMApp', USBRFMApp);
	} catch(e) {
		
	}
};

