let Name = function(parent) {
	this.parent = parent;

	this.tag = document.createElement("div");
	this.tag.className = "Name";
	
	this.signal = new Signal(this, '');
	this.tag.append(this.signal.tag);
	
	this.label = document.createElement('div');
	this.tag.append(this.label);
	this.label.className = 'Label';
};

Name.prototype.set = function(message, show) {
	if (show) {
		this.paintName(message.from);
	}

	this.tag.style.display = show ? "" : "none";
	this.label.textContent = message.from;
	
	if (message.rssi) {
		this.signal.input.setDb(message.rssi);
	}
};

Name.prototype.paintName = function(name) {
	let rng = new Math.seedrandom(name);
	let r = Math.floor(256 * rng());
	let g = Math.floor(256 * rng());
	let b = Math.floor(256 * rng());
	this.label.style["color"] = `rgb(${r},${g},${b})`;
};
