let WebSerial = function() {
	ISerial.call(this);
}; for (let i in ISerial.prototype) WebSerial.prototype[i] = ISerial.prototype[i];

WebSerial.filters = [];
WebSerial.filters.push({ 'usbVendorId' : 0x0403 });
WebSerial.filters.push({ 'usbVendorId' : 0x1A86 });
WebSerial.filters.push({ 'usbVendorId' : 0x1B4F });

WebSerial.prototype.open = async function(options) {
	try {
		this.onlog(`connecting: ${options.baudrate}`);
		this.port = await navigator.serial.requestPort({ 'filters' : WebSerial.filters });
		await this.port.open({'baudRate':options.baudrate});
	} catch(e) {
		console.log(e);
	}
	
	try {
		this.writer = this.port.writable.getWriter();
		this.reader = this.port.readable.getReader();
		this.onconnect();
		this.onlog("connected");
		await this.read();
	} catch(e) {
		this.onerror(e);
	}
};

WebSerial.prototype.close = function() {
	try {
		this.port.close();
		this.writer.releaseLock();
		//this.reader.releaseLock();
	} catch(e) {
		this.onlog(e);
	}
	this.port = null;
};

WebSerial.prototype.send = async function(bytes) {
	await this.writer.write(bytes);
};

WebSerial.prototype.read = async function() {
	const { value, done } = await this.reader.read();
	if (done) {
		console.log("Done releasing reader");
		this.ondisconnect();
		this.reader.releaseLock();
	} else {
		this.ondata(value);
		setTimeout(async () => { try { await this.read(); } catch(e) { this.ondisconnect(); this.onlog(e); }}, 0);
	}
};


