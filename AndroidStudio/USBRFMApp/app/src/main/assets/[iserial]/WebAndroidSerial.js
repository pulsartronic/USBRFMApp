let WebAndroidSerial = function(parent) {
	ISerial.call(this);
	WebAndroidSerial.instance = this;
}; for (let i in ISerial.prototype) WebAndroidSerial.prototype[i] = ISerial.prototype[i];

WebAndroidSerial.prototype.open = async function(options) {
	try {
		this.onlog(`connecting: ${options.baudrate}`);
		let optionsSTR = JSON.stringify(options);
		AndroidSerial.connect(optionsSTR);
	} catch(e) {
		this.onlog(e);
		this.onerror(e);
	}
};

WebAndroidSerial.prototype.onAndroidOpen = async function(options) {
	try {
		this.onlog("connected");
		this.onconnect();
	} catch(e) {
		this.onlog("open USB error");
		this.onlog(e);
		this.onerror(e);
	}
};

WebAndroidSerial.prototype.close = function() {
	AndroidSerial.close();
};

WebAndroidSerial.prototype.send = async function(bytes) {
	AndroidSerial.send(bytes);
};

WebAndroidSerial.prototype.onAndroidData = function(b64) {
	try {
		let buffer = b64.b64ToAB();
		let uint8Buffer = new Uint8Array(buffer);
		this.ondata(uint8Buffer);
	} catch(e) {
		this.onlog(e);
	}
};

WebAndroidSerial.prototype.onAndroidClose = function(b64) {
	try {
		this.ondisconnect();
	} catch(e) {
		this.onlog(e);
	}
};

WebAndroidSerial.prototype.onAndroidLog = async function(text) {
	this.onlog(text);
};

WebAndroidSerial.instance = null;
function AndroidSerial_ondata(b64) {
	if (WebAndroidSerial.instance) {
		WebAndroidSerial.instance.onAndroidData(b64);
	}
}

function AndroidSerial_onopen() {
	if (WebAndroidSerial.instance) {
		WebAndroidSerial.instance.onAndroidOpen();
	}
}

function AndroidSerial_onclose() {
	if (WebAndroidSerial.instance) {
		WebAndroidSerial.instance.onAndroidClose();
	}
}

function AndroidSerial_log(text) {
	if (WebAndroidSerial.instance) {
		WebAndroidSerial.instance.onAndroidLog(text);
	}
}
