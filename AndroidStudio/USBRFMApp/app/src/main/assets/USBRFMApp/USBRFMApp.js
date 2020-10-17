let TSTMP_OPTIONS = {year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'numeric',second:'numeric'};
let TIC_OPTIONS = {year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'numeric'};

///////////////////////////////////////////////////////////////////////////////////
// USBRFMApp
let USBRFMApp = function(parent) {
	RootNode.call(this, parent, 'root');

	this.tag = document.createElement('div');
	this.tag.className = 'Configuration USBRFMApp';

	this.connection = new SerialConnection(this);
	this.tag.append(this.connection.tag);
	this.connection.onConnected = this.onConnected.bind(this);
	this.connection.onDisconnected = this.onDisconnected.bind(this);
	this.connection.onConnectError = this.onConnectError.bind(this);
	this.connection.onCommand = this.oncommand.bind(this);
	
	// TODO:: add another divission
	this.vapp = document.createElement('div');
	this.vapp.className = 'Vapp';
	this.tag.append(this.vapp);

	this.tabs = new Tabs(this);
	this.vapp.append(this.tabs.tag);

	// //////////////////////////////////////////////////////////
	// Visual division
	this.vnodes = document.createElement('div');
	this.vnodes.className = 'Nodes';
	this.vapp.append(this.vnodes);

		this.rfm = new RFM(this, 'rfm');
		this.addNode(this.rfm);
		this.tabs.addTab(this.rfm.tag, 'RFM', false);

		this.serial = new SerialPort(this, 'serial');
		this.addNode(this.serial);
		this.tabs.addTab(this.serial.tag, 'Serial', false);
		this.serial.baudrate.input.input.disabled = true;
		this.serial.config.input.input.disabled = true;
		this.serial.invert.input.input.disabled = true;
		this.serial.bsize.input.input.disabled = true;
		this.serial.rx.input.input.disabled = true;
		this.serial.tx.input.input.disabled = true;

		this.app = new App(this, 'app');
		this.addNode(this.app);
		this.tabs.addTab(this.app.tag, 'App', true);

	this.savebutton = document.createElement('div');
	this.savebutton.className = 'Button';
	this.savebutton.textContent = 'Save Settings';
	this.vapp.append(this.savebutton);
	this.savebutton.onclick = this.saveClicked.bind(this);

	this.separator = document.createElement('div');
	this.separator.className = 'Separator';
	this.tag.append(this.separator);

	this.explanation = document.createElement('div');
	this.explanation.className = 'TextContent';
	this.explanation.textContent = 'Module console log:';
	this.tag.append(this.explanation);
	
	this.console = new Console();
	this.tag.append(this.console.tag);
	
	this.messages = new Messages(this);
	this.messages.tag.style['display'] = 'none';
	this.tag.append(this.messages.tag);
	
	this.tcallback = null;
	this.errors = 0;
};

for (let i in RootNode.prototype)
	USBRFMApp.prototype[i] = RootNode.prototype[i];

USBRFMApp.prototype.init = function() {
	RootNode.prototype.init.call(this);
	this.connection.init();
	this.rfm.init();
	this.serial.init();
	this.app.init();
	this.showConnection(true);
};

USBRFMApp.prototype.addNode = function(node) {
	this.nodes.push(node);
	this.vnodes.append(node.tag);
};

USBRFMApp.prototype.showConnection = function(show) {
	this.connection.tag.style['display'] = show ? '' : 'none';
	this.vapp.style['display'] = !show ? '' : 'none';
};

USBRFMApp.prototype.setOpacity = function(opacity) {
	this.connection.tag.style['opacity'] = opacity;
	this.vapp.style['opacity'] = opacity;
};

USBRFMApp.prototype.onConnected = function() {
	this.showConnection(false);
	this.messages.showWaiting();
	
	let tag = this.tabs.selectedTag();
	this.tabClicked(tag);
};

USBRFMApp.prototype.onDisconnected = function() {
	this.showConnection(true);
	this.log("USB disconnected");
	for (let i in this.nodes) {
		let node = this.nodes[i];
		node.loaded = false;
	}
};

USBRFMApp.prototype.onConnectError = function(e) {
	console.log(e);
	this.showConnection(true);
};

USBRFMApp.prototype.tabClicked = function(tag) {
	let node = tag.node;
	if (!node.loaded) {
		this.messages.showWaiting();
		let command = new CDObject();
			let cnode = new CDObject();
				let state = new CDObject();
				cnode.set("state", state);
			command.set(node.name, cnode);
		this.command(command);
	}
};

USBRFMApp.prototype.oncommand = function(command) {
	console.log("--------------------------------------------------------------------");
	console.log("Receiving from USB/Serial port");
	console.log(CDOS.stringify(command));
	Node.prototype.oncommand.call(this, command);
	this.messages.hideWaiting();
	clearTimeout(this.tcallback);
	this.errors = 0;
};

USBRFMApp.prototype.command = function(command) {
	console.log("--------------------------------------------------------------------");
	console.log("Sending to USB/Serial port");
	console.log(CDOS.stringify(command));
	this.connection.send(command);
	this.tcallback = setTimeout(this.timedout.bind(this, command), 2000);
};

USBRFMApp.prototype.timedout = function(command) {
	clearTimeout(this.tcallback);
	this.errors += 1;
	if (1 < this.errors) {
		this.command(command);
	} else {
		this.messages.showMessage("Connection error ...");
		this.showConnection(true);
		this.connection.close();
	}
};

USBRFMApp.prototype.showMessage = function(message, html = false) {
	this.messages.showMessage(message, html);
};

USBRFMApp.prototype.saveClicked = function() {
	let hasChanges = true;//this.hasChanges();
	if (hasChanges) {
		let valid = this.validate();
		if (valid) {
			this.messages.showWaiting();
			let command = new CDObject();
			this.save(command);
			this.command(command);
		}
	}
};

USBRFMApp.prototype.log = function(text) {
	var now = new Date();
	let date = now.toLocaleDateString('en-US', TSTMP_OPTIONS);
	let line = '[' + date + '] ' + text;
	this.console.addTextLine(line);
};

// /////////////////////////////////////////////////////////////////////////////////////////
// Program entry point
window.onload = () => {
	let config = document.getElementById('config');
	window.app = new USBRFMApp();
	config.append(window.app.tag);
	window.app.init();
};

