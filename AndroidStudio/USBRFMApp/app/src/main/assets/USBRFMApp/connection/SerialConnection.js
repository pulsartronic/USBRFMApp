///////////////////////////////////////////////////////////////////////////////////
// SerialConnection
let SerialConnection = function(parent) {
	this.parent = parent;

	this.tag = document.createElement('div');
	this.tag.className = 'SerialConnection';

	this.title = document.createElement('div');
	this.title.className = 'Title';
	this.title.textContent = 'Serial connection';
	this.tag.append(this.title);

	this.separator = document.createElement('div');
	this.separator.className = 'Separator';
	this.tag.append(this.separator);

	this.baudrate = new InputRow(this, 'Baudrate', 'select', '');
	this.baudrate.addOptions(SerialPort.SPEEDS);
	this.tag.append(this.baudrate.tag);
	// this.baudrate.setHelp('This is the baudrate this interface should use to communicate with the device.');
	this.baudrate.pong(9600);
	
	this.config = new InputRow(this, 'Configuration', 'select', '');
	this.config.addOptions(SerialPort.CONFIG);
	this.tag.append(this.config.tag);
	// this.config.setHelp('This is the default power the module should emmit with.');
	this.config.pong(3);
	
	this.connectButton = document.createElement('div');
	this.connectButton.className = 'Button';
	this.connectButton.textContent = 'connect';
	this.connectButton.onclick = this.connect.bind(this);
	this.tag.append(this.connectButton);
	
	if (!navigator.serial) {
		this.iserial = new WebAndroidSerial();
	} else {
		this.iserial = new WebSerial();
	}
	this.iserial.onconnect = this.onconnect.bind(this);
	this.iserial.ondisconnect = this.ondisconnect.bind(this);
	this.iserial.ondata = this.ondata.bind(this);
	this.iserial.onerror = this.onerror.bind(this);
	this.iserial.onlog = this.onlog.bind(this);

	this.buffer = new Uint8Array();
	this.rcallback = null;
};

SerialConnection.prototype.onConnected = function() {};
SerialConnection.prototype.onConnectError = function() {};
SerialConnection.prototype.onDisconnected = function() {};
SerialConnection.prototype.onCommand = function(command) {};

SerialConnection.prototype.init = function() {
	try {
		let settingsSTR = localStorage.getItem('USBRFMApp');
		let savedSettings = JSON.parse(settingsSTR);
		this.baudrate.pong(savedSettings.connection.baudrate);
		this.config.pong(savedSettings.connection.config);
	} catch(e) {
		console.log(e);
	}
};

SerialConnection.prototype.connect = async function() {
	let options = {};
	options.baudrate = this.baudrate.value()|0;
	options.config = this.config.value()|0;
	
	try {
		let settingsSTR = localStorage.getItem('USBRFMApp') || '{}';
		let savedSettings = JSON.parse(settingsSTR);
		savedSettings.connection = savedSettings.connection || {};
		savedSettings.connection.baudrate = options.baudrate;
		savedSettings.connection.config = options.config;
		let usbRFMApp = JSON.stringify(savedSettings);
		localStorage.setItem('USBRFMApp', usbRFMApp);
	} catch(e) {
		console.log(e);
	}
	
	await this.iserial.open(options);
};

SerialConnection.prototype.onconnect = function() {
	this.onConnected();
};

SerialConnection.prototype.ondisconnect = function() {
	this.onDisconnected();
};

SerialConnection.prototype.onerror = function(e) {
	this.onConnectError(e);
};

SerialConnection.prototype.send = function(command) {
	try {
		let size = command.calculateLength();
		let ui8buffer = new Uint8Array(size);
		let iterator = new CDIterator(ui8buffer, size);
		command.serialize(iterator);
		this.iserial.send(ui8buffer);
	} catch(e) {
		this.onlog(e);
	}
};

SerialConnection.prototype.ondata = function(bytes) {
	clearTimeout(this.rcallback);
	this.rcallback = setTimeout(() => {this.buffer = new Uint8Array();}, 2000);
	
	let newbuffer = new Uint8Array(this.buffer.length + bytes.length);
	newbuffer.set(this.buffer, 0);
	newbuffer.set(bytes, this.buffer.length);
	let iterator = new CDIterator(newbuffer, newbuffer.length);
	let valid = iterator.valid();
	//console.log(bytes);
	if (valid) {
		let command = iterator.nextElement();
		this.buffer = new Uint8Array();
		clearTimeout(this.rcallback);
		this.onCommand(command);
	} else {
		this.buffer = newbuffer;
	}
};

SerialConnection.prototype.onlog = function(text) {
	this.parent.log(text);
};

SerialConnection.prototype.close = function() {
	this.iserial.close();
};


