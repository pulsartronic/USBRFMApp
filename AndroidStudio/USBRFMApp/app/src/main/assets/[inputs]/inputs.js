let IntegerValidator = function(inputRow, min = -Number.MAX_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER) {
	this.inputRow = inputRow;
	this.min = min;
	this.max = max;
	this.inputRow.input.input.step = 1;
	this.inputRow.input.input.min = min;
	this.inputRow.input.input.max = max;
};

IntegerValidator.prototype.validate = function() {
	let value = this.inputRow.value()|0;
	value = Math.max(this.min, Math.min(value, this.max));
	this.inputRow.set(value);
};

IntegerValidator.prototype.value = function() {
	let value = this.inputRow.input.input.value.trim()|0;
	return value;
};

let FloatValidator = function(inputRow, min = -Number.MAX_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER) {
	this.inputRow = inputRow;
	this.min = min;
	this.max = max;
	this.inputRow.input.input.min = min;
	this.inputRow.input.input.max = max;
};

FloatValidator.prototype.validate = function() {
	let value = this.inputRow.value();
	value = parseFloat(value) || 0;
	value = Math.max(this.min, Math.min(value, this.max));
	this.inputRow.set(value);
};

FloatValidator.prototype.value = function() {
	let value = this.inputRow.input.input.value.trim();
	value = parseFloat(value);
	return value;
};

// ///////////////////////////////////////////////////////////////////////////////
// InputRow
let InputRow = function(parent, label, type = 'text', placeholder = '', disabled = false, maxLength = 253) {
	this.parent = parent;

	this.tag = document.createElement('div');
	this.tag.className = 'InputRow';

	this.name = document.createElement('div');
	this.name.className = 'Name';
	this.name.textContent = label;
	this.tag.append(this.name);

	this.input = new InputRow.Input(this, type, placeholder, disabled, maxLength);
	this.tag.append(this.input.tag);
	
	this.help = document.createElement('div');
	this.help.className = 'Help';
	this.help.textContent = '?';
	this.tag.append(this.help);
	this.help.style.display = 'none';
	this.help.onclick = this.helpClicked.bind(this);

	this.validator = null;

	this.onkeydown = null;
	this.default = '';
	this.changed = false;
};

InputRow.prototype.setHelp = function(message) {
	this.help.message = message;
	this.help.style.display = '';
};

InputRow.prototype.helpClicked = function() {
	this.parent.showMessage(this.help.message);
};

InputRow.prototype.message = function(message) {
	this.input.messages.textContent = message;
};

InputRow.prototype.value = function() {
	let value = '';
	if (this.validator) {
		value = this.validator.value();
	} else if ('checkbox' == this.input.input.type) {
		value = this.input.input.checked;
	} else {
		value = this.input.input.value.trim();
	}
	return value;
};

InputRow.prototype.set = function(value) {
	if ('checkbox' != this.input.input.type) {
		this.input.input.value = value;
	} else {
		this.input.input.checked = !!value;
	}
};

InputRow.prototype.pong = function(value) {
	this.default = value;
	if (!this.changed || this.input.input.disabled) {
		if (document.activeElement != this.input.input) {
			this.message('');
			this.set(value);
		}
	}
	this.onchanged();
};

InputRow.prototype.onchanged = function(e) {
	if (this.validator) this.validator.validate();
	let value = this.value();
	this.changed = (this.default != value);
	this.name.style['font-weight'] = this.changed ? 'bold' : '';
	if (this.onchange) this.onchange(this);
	this.message('');
};

InputRow.prototype.keydown = function(e) {
	if (this.onkeydown) this.onkeydown(e);
	switch (e.keyCode) {
		case 27: // ESC
			this.esc();
			break;
	}
};

InputRow.prototype.esc = function() {
	this.set(this.default);
	this.onchanged();
};

InputRow.prototype.addOptions = function(options) {
	this.input.addOptions(options);
};

InputRow.prototype.setOptions = function(options) {
	this.input.setOptions(options);
};

InputRow.prototype.enable = function(enabled) {
	this.input.input.disabled = !enabled;
};

InputRow.prototype.blur = function() {
	this.input.input.blur();
};

// ///////////////////////////////////////////////////////////////////////////////
// InputRow.Input
InputRow.Input = function(parent, type = 'text', placeholder = '', disabled = false, maxLength = 253) {
	this.parent = parent;

	this.tag = document.createElement('div');
	this.tag.className = 'Input';

	this.messages = document.createElement('div');
	this.messages.className = 'Messages';
	this.messages.textContent = '';
	this.tag.append(this.messages);

	if ('select' != type) {
		this.input = document.createElement('input');
		this.input.className = 'Large';
		this.input.type = type;
		this.input['maxlength'] = maxLength;
		this.input.placeholder = placeholder;
		this.input.onkeydown = (e) => {this.parent.keydown(e);};
	} else {
		this.input = document.createElement('select');
	}

	this.input.onchange = (e) => {this.parent.onchanged(e);};
	this.input.disabled = !!disabled;
	this.tag.append(this.input);
};

InputRow.Input.prototype.setOptions = function(options) {
	this.input.selectedIndex = 0;
	this.input.options.length = 0;
	this.addOptions(options);
};

InputRow.Input.prototype.addOptions = function(options) {
	for (let opt of options) {
		let option = new Option(opt[0], opt[1]);
		option.disabled = !!opt[2];
		this.input.add(option);
	}
};


///////////////////////////////////////////////////////////////////////////////////
// StatusRow
let StatusRow = function(parent, label) {
	this.parent = parent;

	this.tag = document.createElement('div');
	this.tag.className = 'InputRow';

	this.name = document.createElement('div');
	this.name.className = 'Name';
	this.name.textContent = label;
	this.tag.append(this.name);

	this.input = new StatusRow.Input(this);
	this.tag.append(this.input.tag);
};

StatusRow.prototype.pong = function(pong) {
	if (WL_CONNECTED == pong.status) {
		this.name.textContent = STATUS[pong.status];
		this.input.label.textContent = pong.ssid;
	} else {
		this.name.textContent = 'status';
		this.input.label.textContent = STATUS[pong.status];
	}

	switch(pong.status) {
		case 3:
			this.input.point.style['background-color'] = '#0F0';
			break;
		case 1:case 4:case 6:
			this.input.point.style['background-color'] = '#F00';
			break;
		default:
			this.input.point.style['background-color'] = '#FF0';
			break;
	}
};

StatusRow.prototype.setStatus = function(status) {
	this.input.label.textContent = STATUS[status];
	switch(status) {
		case 3:
			this.input.point.style['background-color'] = '#0F0';
			break;
		case 1:case 4:case 6:
			this.input.point.style['background-color'] = '#F00';
			break;
		default:
			this.input.point.style['background-color'] = '#FF0';
			break;
	}
};

StatusRow.Input = function(parent) {
	this.parent = parent;

	this.tag = document.createElement('div');
	this.tag.className = 'Input';

	this.point = document.createElement('div');
	this.point.className = 'Point';
	this.tag.append(this.point);

	this.label = document.createElement('div');
	this.label.className = 'Label';
	this.label.textContent = 'unknown';
	this.label.style = 'font-size: 90%; width: 100%;';
	this.tag.append(this.label);
};

///////////////////////////////////////////////////////////////////////////////////
// Signal
let Signal = function(parent, label) {
	this.parent = parent;

	this.tag = document.createElement('div');
	this.tag.className = 'InputRow';

	this.name = document.createElement('div');
	this.name.className = 'Name';
	this.name.textContent = label;
	this.tag.append(this.name);

	this.input = new Signal.Input(this, label);
	this.tag.append(this.input.tag);
};

Signal.prototype.pong = function(pong) {
	let db = (WL_CONNECTED != pong.status) ? -500 : pong.ss;
	this.input.setDb(db);
};

Signal.prototype.fromMillis = function(millis) {
	let db = -500;
	if (100 >= millis) {
		db = -10;
	} else if (300 >= millis) {
		db = -90;
	} else if (800 >= millis) {
		db = -130;
	} else if (5000 >= millis) {
		db = -200;
	}
	this.input.setDb(db);
};

Signal.Input = function(parent) {
	this.parent = parent;

	this.tag = document.createElement('div');
	this.tag.className = 'Input';

	this.icon = new Signal.Input.Icon(this);
	this.tag.append(this.icon.tag);
};

Signal.Input.prototype.setDb = function(db) {
	this.icon.setDb(db);
};

Signal.Input.prototype.setLevel = function(level) {
	this.icon.setLevel(level);
};

Signal.Input.Icon = function(parent) {
	this.parent = parent;

	this.tag = document.createElement('div');
	this.tag.className = 'SignalIcon';

	for (let i = 0; i < 4; i++) {
		this[i] = document.createElement('div');
		this[i].className = `Bar B0${i+1}`;
		this.tag.append(this[i]);
	}
};

Signal.Input.Icon.prototype.setDb = function(db) {
	let level = 3;
	if (+db < -400) {
		level = -1;
	} else if (+db < -130) {
		level = 0;
	} else if (+db < -90) {
		level = 1;
	} else if (+db < -50) {
		level = 2;
	}
	this.setLevel(level);
};

Signal.Input.Icon.prototype.setLevel = function(level) {
	let color = '#0E0';
	if (-1 == level) {
		color = '';
	} else if (0 == level) {
		color = '#E00';
	} else if (1 == level) {
		color = '#EE0';
	} else if (2 == level) {
		color = '#9E0';
	}

	for (let i = 0; i < 4; i++) {
		this[i].style['background-color'] = (i <= level) ? color : '';
	}
};

let NetworkRow = function(parent) {
	this.parent = parent;

	this.tag = document.createElement('div');
	this.tag.className = 'NetworkRow';
	
	this.name = document.createElement('div');
	this.name.className = 'Name';
	this.name.textContent = '';
	this.tag.append(this.name);

	this.signal = new Signal.Input.Icon(this);
	this.tag.append(this.signal.tag);

	this.lock = document.createElement('div');
	this.lock.className = 'Lock';
	this.tag.append(this.lock);

	this.tag.onclick = this.clicked.bind(this);
};

NetworkRow.prototype.clicked = function() {
	this.parent.networkClicked(this);
};

NetworkRow.prototype.setData = function(data) {
	this.name.textContent = data.ssid;
	this.signal.setDb(data.rssi);
};

let NetworkRows = function(parent) {
	this.parent = parent;

	this.tag = document.createElement('div');
	this.tag.className = 'NetworkRows NetworkRowsHidden';

	this.rows = [];
	this.length = 0;
};

NetworkRows.prototype.networkClicked = function(row) {
	this.parent.networkClicked(row);
};

NetworkRows.prototype.reset = function() {
	this.length = 0;
	this.tag.classList.add('NetworkRowsHidden');
	for (let networkRow of this.rows) {
		networkRow.tag.style.display = 'none';
	}
};

NetworkRows.prototype.addNetwork = function(network) {
	let networkRow = this.rows[this.length++];
	if (!networkRow) {
		networkRow = new NetworkRow(this);
		this.rows.push(networkRow);
		this.tag.append(networkRow.tag);
	}
	networkRow.setData(network);
	networkRow.tag.style.display = '';

	this.tag.classList.remove('NetworkRowsHidden');
};

let NetworksList = function(parent) {
	this.parent = parent;

	this.tag = document.createElement('div');
	this.tag.className = 'NetworksList';

	this.networkRows = new NetworkRows(this);
	this.tag.append(this.networkRows.tag)

	this.messages = document.createElement('div');
	this.messages.className = 'Messages';
	this.messages.textContent = 'scan for nearby routers';
	this.tag.append(this.messages);

	this.scanbutton = document.createElement('div');
	this.scanbutton.className = 'Button';
	this.scanbutton.textContent = 'scan';
	this.scanbutton.onclick = this.scanClicked.bind(this);
	this.tag.append(this.scanbutton);

	this.scaning = false;
	this.totalScaned = 0;
};

NetworksList.prototype.reset = function(message) {
	this.scaning = false;
	this.scanbutton.textContent = 'scan';
	this.messages.textContent = message;
	this.networkRows.reset();
};

NetworksList.prototype.scanClicked = function() {
	if (!this.scaning) {
		this.scaning = true;
		this.scanbutton.textContent = 'scaning';
		this.messages.textContent = 'scaning ...';
		this.networkRows.reset();
		this.parent.scanClicked();
	}
};

NetworksList.prototype.scaningResult = function(result) {
	this.totalScaned = result.value|0;
	if (0 < this.totalScaned) {
		this.requestNetwork(0);
	}
};

NetworksList.prototype.requestNetwork = function(index) {
	let command = {};
	command.network = {};
	command.network.i = index;
	this.parent.command(command);
};

NetworksList.prototype.onNetwork = function(network) {
	this.addNetwork(network);
	if (this.totalScaned > (network.index + 1)) {
		this.requestNetwork(network.index + 1);
	} else {
		this.scaning = false;
		this.scanbutton.textContent = 'refresh';
		this.messages.textContent = '';
	}
};

NetworksList.prototype.addNetwork = function(network) {
	this.networkRows.addNetwork(network);
};

NetworksList.prototype.networkClicked = function(row) {
	this.parent.networkClicked(row);
};

let Advanced = function(parent, label) {
	this.parent = parent;

	this.tag = document.createElement('div');
	this.tag.className = 'Advanced';

	this.title = new Advanced.Title(this, label);
	this.title.tag.onclick = this.toggleWindow.bind(this);
	this.tag.append(this.title.tag);

	this.window = new Advanced.Window(this);
	this.tag.append(this.window.tag);
};

Advanced.prototype.close = function() {
	this.window.tag.classList.remove('WindowOpen');
	this.title.arrow.classList.remove('ArrowDown');
};

Advanced.prototype.open = function() {
	this.window.tag.classList.add('WindowOpen');
	this.title.arrow.classList.add('ArrowDown');
};

Advanced.prototype.toggleWindow = function() {
	this.window.tag.classList.toggle('WindowOpen');
	this.title.arrow.classList.toggle('ArrowDown');
};

Advanced.prototype.addInput = function(tag) {
	this.window.tag.append(tag);
};

Advanced.prototype.append = function(tag) {
	this.addInput(tag);
};

Advanced.Title = function(parent, label) {
	this.parent = parent;

	this.tag = document.createElement('div');
	this.tag.className = 'Title';

	this.arrow = document.createElement('div');
	this.arrow.className = 'Arrow';
	this.tag.append(this.arrow);

	this.label = document.createElement('div');
	this.label.className = 'Label';
	this.label.textContent = label;
	this.tag.append(this.label);
};

Advanced.Window = function(parent) {
	this.parent = parent;

	this.tag = document.createElement('div');
	this.tag.className = 'Window';
};

///////////////////////////////////////////////////////////////////////////////////
// Tabs
let Tabs = function(parent) {
	this.parent = parent;

	this.tag = document.createElement('div');
	this.tag.className = 'Tabs';

	this.selected = 0;
	this.tags = [];
};

Tabs.prototype.addTab = function(tag, label, selected = false) {
	let index = this.tags.length;
	this.tags.push(tag);
	tag.style['display'] = selected ? '' : 'none';
	this[index] = document.createElement('div');
	this[index].className = 'Tab T0' + index + (!!selected ? ' Selected' : '');
	this[index].textContent = label;
	this[index].onclick = this.clicked.bind(this, index);
	this.tag.append(this[index]);
	if (selected) this.selected = index;
};

Tabs.prototype.clicked = function(index) {
	this[this.selected].classList.remove('Selected');
	this.tags[this.selected].style['display'] = 'none';
	this[this.selected = index].classList.add('Selected');
	this.tags[this.selected].style['display'] = '';
	if (this.parent.tabClicked) {
		this.parent.tabClicked(this.tags[this.selected]);
	}
};

Tabs.prototype.selectedTag = function() {
	return this.tags[this.selected];
};

///////////////////////////////////////////////////////////////////////////////////
// Messages
let Messages = function(parent) {
	this.parent = parent;

	this.tag = document.createElement('div');
	this.tag.className = 'SystemMessages';

	this.window = new Messages.Window(this, '', 'OK');
	this.tag.append(this.window.tag);

	this.wicon =  document.createElement('div');
	this.wicon.className = 'Icon';
	this.tag.append(this.wicon);

	this.wicon.icon =  document.createElement('div');
	this.wicon.icon.className = 'Icon';
	this.wicon.append(this.wicon.icon);

	this.window.tag.style['display'] = 'none';
	this.wicon.style['display'] = 'none';
};

Messages.prototype.showMessage = function(message, html = false) {
	this.tag.style['display'] = '';
	this.window.tag.style['display'] = '';
	if (html) {
		this.window.label.innerHTML = '';
		setTimeout( () => {
			this.window.label.innerHTML = message;
		}, 0); // RESET SCROLL
	} else {
		this.window.label.textContent = message;
	}
	this.wicon.style['display'] = 'none';
	this.parent.setOpacity(0.6);
};

Messages.prototype.hideWaiting = function() {
	this.wicon.style['display'] = 'none';
	if ('none' == this.window.tag.style['display']) {
		this.tag.style['display'] = 'none';
		this.parent.setOpacity(1);
	}
};

Messages.prototype.showWaiting = function(message) {
	this.tag.style['display'] = '';
	if ('none' == this.window.tag.style['display']) {
		this.wicon.style['display'] = '';
		this.parent.setOpacity(0.6);
	}
};

Messages.prototype.okClicked = function() {
	this.window.tag.style['display'] = 'none';
	this.wicon.style['display'] = 'none';
	this.tag.style['display'] = 'none';
	this.parent.setOpacity(1);
};

Messages.Window = function(parent) {
	this.parent = parent;

	this.tag = document.createElement('div');
	this.tag.className = 'Window';

	this.label = document.createElement('div');
	this.label.className = 'Label';
	this.label.textContent = '';
	this.tag.append(this.label);

	this.button = document.createElement('div');
	this.button.className = 'Button';
	this.button.textContent = '\u2716';
	this.button.onclick = () => {this.parent.okClicked();};
	this.tag.append(this.button);
};




