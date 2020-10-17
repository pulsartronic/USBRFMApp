
let TXPWS = [];
TXPWS.push(['2 dB', 2]);
TXPWS.push(['3 dB', 3]);
TXPWS.push(['4 dB', 4]);
TXPWS.push(['5 dB', 5]);
TXPWS.push(['6 dB', 6]);
TXPWS.push(['7 dB', 7]);
TXPWS.push(['8 dB', 8]);
TXPWS.push(['9 dB', 9]);
TXPWS.push(['10 dB', 10]);
TXPWS.push(['11 dB', 11]);
TXPWS.push(['12 dB', 12]);
TXPWS.push(['13 dB', 13]);
TXPWS.push(['14 dB', 14]);
TXPWS.push(['15 dB', 15]);
TXPWS.push(['16 dB', 16]);
TXPWS.push(['17 dB', 17]);
TXPWS.push(['18 dB', 18]);
TXPWS.push(['19 dB', 19]);
TXPWS.push(['20 dB', 20]);

let SFACS = [];
SFACS[0] = ['6', 6];
SFACS[1] = ['7', 7];
SFACS[2] = ['8', 8];
SFACS[3] = ['9', 9];
SFACS[4] = ['10', 10];
SFACS[5] = ['11', 11];
SFACS[6] = ['12', 12];

let SBWS = [];
SBWS[0] = ['7800 Hz', 7800];
SBWS[1] = ['10400 Hz', 10400];
SBWS[2] = ['15600 Hz', 15600];
SBWS[3] = ['20800 Hz', 20800];
SBWS[4] = ['31250 Hz', 31250];
SBWS[5] = ['41700 Hz', 41700];
SBWS[6] = ['62500 Hz', 62500];
SBWS[7] = ['125000 Hz', 125000];
SBWS[8] = ['250000 Hz', 250000];

let CRATS = [];
CRATS[0] = ['5', 5];
CRATS[1] = ['6', 6];
CRATS[2] = ['7', 7];
CRATS[3] = ['8', 8];


///////////////////////////////////////////////////////////////////////////////////
// RFM
let RFM = function(parent, name) {
	Node.call(this, parent, name);

	this.tag = document.createElement('div');
	this.tag.className = 'RFM';
	this.tag.node = this;

	this.title = document.createElement('div');
	this.title.className = 'Title';
	this.title.textContent = 'Radio Frequency Module:';
	this.tag.append(this.title);
	this.title.style.width = 'calc(100% - 1.2em)';

	// this.help = document.createElement('div');
	// this.help.className = 'Help';
	// this.help.textContent = '?';
	// this.tag.append(this.help);
	// this.help.onclick = this.showMessage.bind(this, STD_HELP);

	this.separator = document.createElement('div');
	this.separator.className = 'Separator';
	this.tag.append(this.separator);

	this.status = new StatusRow(this, 'status');
	this.tag.append(this.status.tag);
	this.status.input.label.textContent = 'initialized';
	this.status.input.point.style['background-color'] = '#0F0';

	this.freq = new InputRow(this, 'Frequency MHz', 'text', '');
	this.tag.append(this.freq.tag);
	this.freq.validator = new FloatValidator(this.freq);
	this.freq.setHelp('This is the frequency the Radio Frequency Module is currently operaing at.');
	// TODO:: add channels explanation
	// Frequency plans implemented here can be found in:
	// https://www.thethingsnetwork.org/docs/lorawan/frequency-plans.html

	this.configuration = new Advanced(this, 'Configuration');
	this.configuration.tag.className = 'Advanced';
	this.tag.append(this.configuration.tag);

	this.minfreq = new InputRow(this, 'MAX Frequency', 'text', '');
	this.minfreq.tag.classList.add('Boundary');
	this.configuration.append(this.minfreq.tag);
	this.minfreq.validator = new FloatValidator(this.minfreq);
	this.minfreq.setHelp(`MHz min and max are the boundaries the Radio Frequency Module can operate at. TTN is going to tell the gateway the frequency it should use to emit DOWN packets, if it's outside this boundaries, the gateway will answer TTN with an 'unsupported frequency error'.`);
	// TODO:: add tipical values explanation

	this.maxfreq = new InputRow(this, 'MIN Frequency', 'text', '');
	this.maxfreq.tag.classList.add('Boundary');
	this.configuration.append(this.maxfreq.tag);
	this.maxfreq.validator = new FloatValidator(this.maxfreq);

	this.txpw = new InputRow(this, 'TX power', 'select', '');
	this.txpw.addOptions(TXPWS);
	this.configuration.append(this.txpw.tag);
	this.txpw.setHelp('This is the default power the module should emmit with.');

	this.cad = new InputRow(this, 'CAD', 'checkbox', '');
	this.cad.input.input.className = '';
	this.cad.input.input.disabled = true;
	this.configuration.append(this.cad.tag);
	this.cad.setHelp(`CAD Stands for Channel Activity Detection, this version doesn't supoprt it, it will be added in a future release.`);

	this.sfac = new InputRow(this, 'Spreading Factor', 'select', '');
	this.sfac.addOptions(SFACS);
	this.configuration.append(this.sfac.tag);
	this.sfac.setHelp('This is the Spreading Factor the Radio Frequency Module is going to use to receive packets if CAD is turned OFF (wich in this version is still unsupported). TTN is going to tell the gateway which SF it should use to emit DOWN packets.');

	this.sbw = new InputRow(this, 'Band Width', 'select', '');
	this.sbw.addOptions(SBWS);
	this.configuration.append(this.sbw.tag);
	this.sbw.setHelp('This is the Bandwidth the Radio Frequency Module is going to use to receive packets if CAD is turned OFF (wich in this version is still unsupported). TTN is going to tell the gateway wich Bandwidth configuration it should use to emit DOWN packets.');

	// TODO:: add crat

	this.plength = new InputRow(this, 'Preamble Length', 'text', '');
	this.plength.tag.classList.add('Short');
	this.configuration.append(this.plength.tag);
	this.plength.validator = new IntegerValidator(this.plength, 1);
	this.plength.setHelp('This is an advanced configuration, default value should work, yet you can change it if you need.');
	// TODO:: add link to wikipedia

	this.sw = new InputRow(this, 'Sync Word', 'text', '');
	this.sw.tag.classList.add('Short');
	this.configuration.append(this.sw.tag);
	this.sw.validator = new ByteValidator(this.sw);
	this.sw.setHelp('This is an advanced configuration, default value should work, yet you can change it if you need.');
	// TODO:: add link to wikipedia

	this.pins = new Advanced(this, 'PIN connections');
	this.pins.tag.className = 'Advanced Pins';
	this.tag.append(this.pins.tag);

	this.explanation = document.createElement('div');
	this.explanation.className = 'TextContent';
	this.explanation.textContent = 'PIN configuration (disabled options are not available in this version)';
	this.pins.append(this.explanation);

	this.separator = document.createElement('div');
	this.separator.className = 'Separator';
	this.pins.append(this.separator);

	this.miso = new InputRow(this, 'MISO', 'select', '', true);
	this.miso.addOptions(PINS);
	this.pins.append(this.miso.tag);

	this.mosi = new InputRow(this, 'MOSI', 'select', '', true);
	this.mosi.addOptions(PINS);
	this.pins.append(this.mosi.tag);

	this.sck = new InputRow(this, 'SCK', 'select', '', true);
	this.sck.addOptions(PINS);
	this.pins.append(this.sck.tag);

	this.nss = new InputRow(this, 'nss', 'select', '');
	this.nss.addOptions(PINS);
	this.pins.append(this.nss.tag);

	this.rst = new InputRow(this, 'reset', 'select', '');
	this.rst.addOptions(PINS);
	this.pins.append(this.rst.tag);

	for (let i = 0; i <= 5; i++) {
		let diox = this[`dio${i}`] = new InputRow(this, `dio${i}`, 'select', '', !!i);
		diox.addOptions(PINS);
		this.pins.append(diox.tag);
	}
};

// Inheritance
for (let i in Node.prototype)
	RFM.prototype[i] = Node.prototype[i];


RFM.prototype.init = function(data) {

};

RFM.prototype.isChanged = function() {
    let changed =  this.freq.changed
	          || this.minfreq.changed
	          || this.maxfreq.changed
	          || this.sfac.changed
	          || this.txpw.changed
	          || this.sbw.changed
	          || this.plength.changed
	          || this.sw.changed
	          || this.miso.changed
	          || this.mosi.changed
	          || this.sck.changed
	          || this.nss.changed
	          || this.rst.changed;

    for (let i = 0; i <= 5; i++)
        changed = changed || this[`dio${i}`].changed;

	return changed;
};

RFM.prototype.save = function(command) {
	Node.prototype.save.call(this, command);
	let isChanged = this.isChanged();
	if (isChanged) {
		let rfm = command.object('save');
		if (this.freq.changed || this.minfreq.changed || this.maxfreq.changed) {
			let freq = rfm.object('freq');
			if (this.freq.changed) {
				let curr = freq.number('curr');
				curr.setUInt32(1000000 * this.freq.value());
			}
			
			if (this.minfreq.changed) {
				let min = freq.number('min');
				min.setUInt32(1000000 * this.minfreq.value());
			}
			
			if (this.maxfreq.changed) {
				let max = freq.number('max');
				max.setUInt32(1000000 * this.maxfreq.value());
			}
		}
		
		// rfm.cad = 0;
		
		if (this.sfac.changed) {
			let sfac = rfm.number('sfac');
			sfac.setUInt8(this.sfac.value()|0);
		}
		
		if (this.sbw.changed) {
			let sbw = rfm.number('sbw');
			sbw.setUInt32(this.sbw.value()|0);
		}
		
		if (this.plength.changed) {
			let plength = rfm.number('plength');
			plength.setUInt8(this.plength.value()|0);
		}
		
		if (this.sw.changed) {
			let sw = rfm.number('sw');
			sw.setUInt8(this.sw.value());
		}
		
		if (this.txpw.changed) {
			let txpw = rfm.number('txpw');
			txpw.setUInt8(this.txpw.value());
		}
		
		let dioChanged = false;
		for (let i = 0; i <= 5; i++)
        	dioChanged = dioChanged || this[`dio${i}`].changed;
        
		if (this.miso.changed || this.mosi.changed || this.sck.changed || this.nss.changed || this.rst.changed || dioChanged) {
			let pins = rfm.object('pins');
			if (this.miso.changed) {
				let miso = pins.number('miso');
				miso.setUInt8(this.miso.value() | 0);
			}
			
			if (this.mosi) {
				let mosi = pins.number('mosi');
				mosi.setUInt8(this.mosi.value() | 0);
			}
			
			if (this.sck.changed) {
				let sck = pins.number('sck');
				sck.setUInt8(this.sck.value() | 0);
			}
			
			if (this.nss.changed) {
				let nss = pins.number('nss');
				nss.setUInt8(this.nss.value() | 0);
			}
			
			if (this.rst) {
				let rst = pins.number('rst');
				rst.setUInt8(this.rst.value() | 0);
			}
			
			if (dioChanged) {
				let dio = pins.array('dio');
				for (let i = 0; i <= 5; i++) {
					let diox = new CDNumber();
					diox.setUInt8(this[`dio${i}`].value()|0);
					dio.add(diox);
				}
			}
		}
	}
};

RFM.prototype.state = function(params) {
	this.loaded = true;

	let statusElement = params.get('status');
	if (statusElement) {
		let status = statusElement.int();
		this.status.input.label.textContent = status ? 'initialized' : 'stoped';
		this.status.input.point.style['background-color'] = status ? '#0F0' : '#F00';
	}

	let config = params.get('config');
	if (config) {
		let freqElement = config.get('freq');
		if (freqElement) {
			let currElement = freqElement.get('curr');
			if (currElement) {
				let curr = currElement.uint();
				this.freq.pong(curr / 1000000);
			}
			
			let minElement = freqElement.get('min');
			if (minElement) {
				let min = minElement.uint();
				this.minfreq.pong(min / 1000000);
			}
			
			let maxElement = freqElement.get('max');
			if (maxElement) {
				let max = maxElement.uint();
				this.maxfreq.pong(max / 1000000);
			}
		}
		
		let cadElement = config.get('cad');
		if (cadElement) {
			let cad = cadElement.uint();
			this.cad.pong(!!cad);
		}
		
		let txpwElement = config.get('txpw');
		if (txpwElement) {
			let txpw = txpwElement.uint();
			this.txpw.pong(txpw);
		}
		
		let sfacElement = config.get('sfac');
		if (sfacElement) {
			let sfac = sfacElement.uint();
			this.sfac.pong(sfac);
		}
		
		let sbwElement = config.get('sbw');
		if (sbwElement) {
			let sbw = sbwElement.uint();
			this.sbw.pong(sbw);
		}
		
		let plengthElement = config.get('plength');
		if (plengthElement) {
			let plength = plengthElement.uint();
			this.plength.pong(plength);
		}
		
		let swElement = config.get('sw');
		if (swElement) {
			let sw = swElement.uint() || '1';
			this.sw.pong('0x' + `${sw.toString(16)}`.padStart(2, '0'));
		}
		
		let pinsElement = config.get('pins');
		if (pinsElement) {
			let misoElement = pinsElement.get('miso');
			let miso = misoElement.int();
			this.miso.pong(miso);
			
			let mosiElement = pinsElement.get('mosi');
			let mosi = mosiElement.int();
			this.mosi.pong(mosi);
			
			let sckElement = pinsElement.get('sck');
			let sck = sckElement.int();
			this.sck.pong(sck);
			
			let nssElement = pinsElement.get('nss');
			let nss = nssElement.int();
			this.nss.pong(nss);
			
			let rstElement = pinsElement.get('rst');
			let rst = rstElement.int();
			this.rst.pong(rst);
			
			let diosElement = pinsElement.get('dio');
			if (diosElement) {
				let length = diosElement.length();
				for (let i = 0; i < length; i++) {
					let diox = this[`dio${i}`];
					if (diox) {
						let dioElement = diosElement.get(i);
						let dio = dioElement.int();
						diox.pong(dio);
					}
				}
			}
		}
	}
};

RFM.prototype.showMessage = function(message) {
	this.parent.showMessage(message, true);
};


let ByteValidator = function(inputRow, min = 0, max = 255) {
	this.inputRow = inputRow;
	this.min = min;
	this.max = max;
	this.inputRow.input.input.step = 1;
	this.inputRow.input.input.min = min;
	this.inputRow.input.input.max = max;
};

ByteValidator.prototype.validate = function() {
	let value = this.inputRow.value()|0;
	value = Math.max(this.min, Math.min(value, this.max));
	value = `0x${value.toString(16).padStart(2, '0')}`;
	this.inputRow.set(value);
};

ByteValidator.prototype.value = function() {
	let value = this.inputRow.input.input.value.trim()|0;
	return value;
};


