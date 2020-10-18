///////////////////////////////////////////////////////////////////////////////////
// SerialPort
let SerialPort = function(parent, name) {
	Node.call(this, parent, name);

	this.tag = document.createElement('div');
	this.tag.className = 'SerialPort';
	this.tag.node = this;

	this.title = document.createElement('div');
	this.title.className = 'Title';
	this.title.textContent = 'SerialPort port';
	this.tag.append(this.title);
	this.title.style.width = 'calc(100% - 1.2em)';

	this.separator = document.createElement('div');
	this.separator.className = 'Separator';
	this.tag.append(this.separator);

	this.status = new StatusRow(this, 'status');
	this.tag.append(this.status.tag);
	this.status.input.label.textContent = 'unknown';
	this.status.input.point.style['background-color'] = '#FF0';

	this.baudrate = new InputRow(this, 'Baudrate', 'select', '');
	this.baudrate.addOptions(SerialPort.SPEEDS);
	this.tag.append(this.baudrate.tag);
	//this.baudrate.setHelp('This is the default power the module should emmit with.');

	this.config = new InputRow(this, 'Configuration', 'select', '');
	this.config.addOptions(SerialPort.CONFIG);
	this.tag.append(this.config.tag);
	//this.config.setHelp('This is the default power the module should emmit with.');

	this.advanced = new Advanced(this, 'Advanced');
	this.advanced.tag.className = 'Advanced';
	this.tag.append(this.advanced.tag);

	this.invert = new InputRow(this, 'invert', 'checkbox', '');
	this.invert.input.input.className = '';
	this.advanced.append(this.invert.tag);

	this.bsize = new InputRow(this, 'rx buffer', 'number', '');
	this.bsize.validator = new IntegerValidator(this.bsize, 1);
	this.advanced.append(this.bsize.tag);
	this.bsize.tag.style['display'] = 'none';

	this.rx = new InputRow(this, 'RX', 'select', '');
	this.rx.addOptions(PINS);
	this.rx.addOptions([['RXD0', 127]]);
	this.advanced.append(this.rx.tag);

	this.tx = new InputRow(this, 'TX', 'select', '');
	this.tx.addOptions(PINS);
	this.tx.addOptions([['TXD0', 127]]);
	this.advanced.append(this.tx.tag);
};

// Inheritance
for (let i in Node.prototype)
	SerialPort.prototype[i] = Node.prototype[i];


SerialPort.TYPES = [];
SerialPort.TYPES.push(['Software', SerialPort.TYPES.length]);
SerialPort.TYPES.push(['Hardware', SerialPort.TYPES.length]);

SerialPort.SPEEDS = [];
SerialPort.SPEEDS.push(['300', 300]);
SerialPort.SPEEDS.push(['600', 600]);
SerialPort.SPEEDS.push(['1200', 1200]);
SerialPort.SPEEDS.push(['2400', 2400]);
SerialPort.SPEEDS.push(['4800', 4800]);
SerialPort.SPEEDS.push(['9600', 9600]);
SerialPort.SPEEDS.push(['14400', 14400]);
SerialPort.SPEEDS.push(['19200', 19200]);
SerialPort.SPEEDS.push(['28800', 28800]);
SerialPort.SPEEDS.push(['38400', 38400]);
SerialPort.SPEEDS.push(['57600', 57600]);
SerialPort.SPEEDS.push(['115200', 115200]);

SerialPort.CONFIG = [];
SerialPort.CONFIG.push(['SERIAL_5N1', SerialPort.CONFIG.length]);
SerialPort.CONFIG.push(['SERIAL_6N1', SerialPort.CONFIG.length]);
SerialPort.CONFIG.push(['SERIAL_7N1', SerialPort.CONFIG.length]);
SerialPort.CONFIG.push(['SERIAL_8N1', SerialPort.CONFIG.length]);
SerialPort.CONFIG.push(['SERIAL_5N2', SerialPort.CONFIG.length]);
SerialPort.CONFIG.push(['SERIAL_6N2', SerialPort.CONFIG.length]);
SerialPort.CONFIG.push(['SERIAL_7N2', SerialPort.CONFIG.length]);
SerialPort.CONFIG.push(['SERIAL_8N2', SerialPort.CONFIG.length]);
SerialPort.CONFIG.push(['SERIAL_5E1', SerialPort.CONFIG.length]);
SerialPort.CONFIG.push(['SERIAL_6E1', SerialPort.CONFIG.length]);
SerialPort.CONFIG.push(['SERIAL_7E1', SerialPort.CONFIG.length]);
SerialPort.CONFIG.push(['SERIAL_8E1', SerialPort.CONFIG.length]);
SerialPort.CONFIG.push(['SERIAL_5E2', SerialPort.CONFIG.length]);
SerialPort.CONFIG.push(['SERIAL_6E2', SerialPort.CONFIG.length]);
SerialPort.CONFIG.push(['SERIAL_7E2', SerialPort.CONFIG.length]);
SerialPort.CONFIG.push(['SERIAL_8E2', SerialPort.CONFIG.length]);
SerialPort.CONFIG.push(['SERIAL_5O1', SerialPort.CONFIG.length]);
SerialPort.CONFIG.push(['SERIAL_6O1', SerialPort.CONFIG.length]);
SerialPort.CONFIG.push(['SERIAL_7O1', SerialPort.CONFIG.length]);
SerialPort.CONFIG.push(['SERIAL_8O1', SerialPort.CONFIG.length]);
SerialPort.CONFIG.push(['SERIAL_5O2', SerialPort.CONFIG.length]);
SerialPort.CONFIG.push(['SERIAL_6O2', SerialPort.CONFIG.length]);
SerialPort.CONFIG.push(['SERIAL_7O2', SerialPort.CONFIG.length]);
SerialPort.CONFIG.push(['SERIAL_8O2', SerialPort.CONFIG.length]);

SerialPort.MODES = [];
SerialPort.MODES.push(['SERIAL_FULL', SerialPort.MODES.length]);
SerialPort.MODES.push(['SERIAL_RX_ONLY', SerialPort.MODES.length]);
SerialPort.MODES.push(['SERIAL_TX_ONLY', SerialPort.MODES.length]);

SerialPort.prototype.init = function() {

};

SerialPort.prototype.state = function(params) {
	this.loaded = true;

	let statusElement = params.get('status');
	if (statusElement) {
		let status = statusElement.int();
		this.status.input.label.textContent = status ? 'initialized' : 'stoped';
		this.status.input.point.style['background-color'] = status ? '#0F0' : '#F00';
	}
	
	let config = params.get("config");
	if (config) {
		let baudrateElement = config.get('baudrate');
		if (baudrateElement) {
			let baudrate = baudrateElement.int();
			this.baudrate.pong(baudrate);
		}
		
		let configElement = config.get('config');
		if (configElement) {
			let config = configElement.int();
			this.config.pong(config);
		}
		
		let invertElement = config.get('invert');
		if (invertElement) {
			let invert = invertElement.int();
			this.invert.pong(invert);
		}
		
		let bsizeElement = config.get('bsize');
		if (bsizeElement) {
			this.bsize.tag.style['display'] = '';
			let bsize = bsizeElement.uint();
			this.bsize.pong(bsize);
		}
		
		let rxElement = config.get('rx');
		if (rxElement) {
			let rx = rxElement.int();
			this.rx.pong(rx);
		}
		
		let txElement = config.get('tx');
		if (txElement) {
			let tx = txElement.int();
			this.tx.pong(tx);
		}
	}
};

SerialPort.prototype.showMessage = function(message) {
	this.parent.showMessage(message, true);
};

SerialPort.prototype.isChanged = function(command) {
	return this.baudrate.changed
	    || this.config.changed
	    || this.invert.changed
	    || this.bsize.changed
	    || this.rx.changed
	    || this.tx.changed;
};

SerialPort.prototype.save = function(command) {
	Node.prototype.save.call(this, command);
	let isChanged = this.isChanged();
	if (isChanged) {
		let serial = command.newObject('save');
		
		if (this.baudrate.changed) {
			let baudrate = serial.newNumber('baudrate');
			baudrate.setUInt32(this.baudrate.value()|0);
		}
		
		if (this.config.changed) {
			let config = serial.newNumber('config');
			config.setUInt8(this.config.value()|0);
		}
			
		if (this.invert.changed) {
			let invert = serial.newNumber('invert');
			invert.setUInt8(this.invert.value()|0);
		}
		
		if (this.bsize.changed) {
			let bsize = serial.newNumber('bsize');
			bsize.setUInt16(this.bsize.value()|0);
		}
		
		if (this.rx.changed) {
			let rx = serial.newNumber('rx');
			rx.setUInt8(this.rx.value()|0);
		}
		
		if (this.tx.changed) {
			let tx = serial.newNumber('tx');
			tx.setUInt8(this.tx.value()|0);
		}
	}
};

