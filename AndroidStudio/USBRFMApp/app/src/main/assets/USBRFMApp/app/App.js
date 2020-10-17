/**
 * This is an example web app which reads/writes bytes from/to a LoRa device
 */
///////////////////////////////////////////////////////////////////////////////////
// App
let App = function(parent, name) {
	Node.call(this, parent, name);

	this.tag = document.createElement('div');
	this.tag.className = 'App';
	this.tag.node = this;

	// //////////////////////////////////////////////////////////////
	// CHAT specific code
	this.tabs = new Tabs(this);
	this.tag.append(this.tabs.tag);
	this.settings = new Settings(this);
	this.tag.append(this.settings.tag);
	this.tabs.addTab(this.settings.tag, 'settings', false);
	this.chat = new Chat(this);
	this.chat.tag.style['display'] = 'none';
	this.tag.append(this.chat.tag);
	this.tabs.addTab(this.chat.tag, 'chat', true);
	this.chat.onuserinput = this.onuserinput.bind(this);
	this.chat.chatbox.input.input.maxLength = 128;
	// //////////////////////////////////////////////////////////////
};

// Inheritance
for (let i in Node.prototype)
	App.prototype[i] = Node.prototype[i];


/*
 * This is called once all initial html elements are appended to the document
 */
App.prototype.init = function() {
	// //////////////////////////////////////////////////////////////
	// CHAT specific code
	this.settings.init();
	let message = {};
	message.own = true;
	message.from = this.settings.user.value();
	message.text = 'USB RFM App v1.0 - chat room';
	this.chat.onmessage(message);
	// //////////////////////////////////////////////////////////////
};


/*
 * This is called from the arduino, and it means that communication is possible
 */
App.prototype.state = function(params) {
	this.loaded = true;
};


/*
 * This is called when the user clicks the send button
 */
App.prototype.onuserinput = function(text) {
	// //////////////////////////////////////////////////////////////
	// CHAT specific code
	let message = {};
	message.own = true;
	message.from = this.settings.user.value();
	message.text = text;
	this.chat.onmessage(message);
	let smessage = new CDObject();
		let from = new CDNumber(message.from);
		smessage.set('from', from);
		let stext = new CDNumber(text);
		smessage.set('text', stext);
	let length = smessage.calculateLength();
	let buffer = new Uint8Array(length);
	let iterator = new CDIterator(buffer, buffer.length);
	smessage.serialize(iterator);
	// ////////////////////////////////////////////////////////////////////////
	
	
	
	
	// ////////////////////////////////////////////////////////////////////////
	// these are the raw bytes the RFM module is going to emit, change it.
	// do something like 
	// let ebuffer = new Uint8Array([0x21, 0x43 ... your values]);
	let ebuffer = this.settings.aesm.encrypt(buffer);
	// ////////////////////////////////////////////////////////////////////////
	// send data --->  AndroidApp -> USB -> Arduino -> LoRa
	let command = new CDObject();
		let send = new CDObject();
			let data = new CDNumber();
			data.setBuffer(ebuffer);
		send.set('data', data);
	command.set('send', send);
	this.command(command);
};

/*
 * This is called in response to a transmission
 */
App.prototype.sent = function(params) {
	let totalElement = params.get('total');
	let total = totalElement.int();
	console.log("total sent: " + total + " bytes");
};

/*
 + This is called when the RFM module receives data
 */
App.prototype.ondata = function(params) {
	try {
		let dataElement = params.get("data");
		let rssiElement = params.get('rssi'); // Received Signal Strength Indicator
		let snrElement = params.get('snr'); // Signal-to-noise ratio
		let pfeElement = params.get('pfe'); // Packet Frequency Error
		
		// ////////////////////////////////////////////////////////////////////////
		// these are the raw bytes the RFM module received, make somethig with them
		let ebuffer = dataElement.bytes;
		// extra information about the received packet
		let rssi = rssiElement.int();
		let snr = snrElement.float();
		let pfe = pfeElement.int();
		// ////////////////////////////////////////////////////////////////////////
		
		// //////////////////////////////////////////////////////////////
		// CHAT specific code
		let buffer = this.settings.aesm.decrypt(ebuffer);
		let iterator = new CDIterator(buffer, buffer.length);
		let valid = iterator.valid();
		if (valid) {
			let smessage = iterator.nextElement();
			let fromElement = smessage.get('from');
			let textElement = smessage.get('text');
			let message = {};
			message.own = false;
			message.from = fromElement.string();
			message.text = textElement.string();
			message.rssi = rssiElement.int();
			this.chat.onmessage(message);
		}
		// //////////////////////////////////////////////////////////////
	} catch(e) {
		console.log(e);
	}
};


