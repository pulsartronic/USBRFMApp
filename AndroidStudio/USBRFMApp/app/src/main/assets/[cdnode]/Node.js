let Node = function(parent, name) {
	this.parent = parent;
	this.name = name;
	
	this.nodes = [];
};

Node.prototype.name = '';

Node.prototype.addNode = function(node) {
	this.tag.append(node.tag);
	this.nodes.push(node);
};

Node.prototype.oncommand = function(command) {
	// we want parent's methods to be called before children's
	for (let i in command.keys) {
		let key = command.keys[i];
		let attribute = this[i];
		if ('function' == typeof attribute) {
			let mparams = key.value;
			attribute.call(this, mparams);
		}
	}

	for (let i in command.keys) {
		let key = command.keys[i];
		let attribute = this[i];
		if ('object' == typeof attribute) {
			if (attribute.oncommand) {
				let icommand = key.value;
				attribute.oncommand(icommand);
			} else {
				console.log(`Unimplemented ${i}.oncommand(command)`);
			}
		} else if ('function' != typeof attribute) {
			console.log(`Unknown property ${this.name}.${i}`);
		}
	}
};

Node.prototype.stateCommand = function() {
	let command = new CDObject();
	let stateElement = new CDObject();
	command.set('state', stateElement);
	return command;
};

// <--
Node.prototype.command = function(command) {
	let pcommand = new CDObject();
	pcommand.set(this.name, command);
	this.parent.command(pcommand);
};

Node.prototype.log = function(params) {
	console.log(this.name + ' : ' + params.text);
};

// call generation ...
Node.prototype.hasChanges = function() {
	let hasChanges = this.isChanged();
	for (let node of this.nodes) {
		hasChanges = hasChanges || node.hasChanges();
	}
	return hasChanges;
};

Node.prototype.isChanged = function() {
	return false;
};

Node.prototype.save = function(command) {
	for (let key in this.nodes) {
		let node = this.nodes[key];
		let hasChanges = node.hasChanges();
		if (hasChanges) {
			let icommand = command.get(node.name);
			if (!icommand) {
				icommand = new CDObject();
				command.set(node.name, icommand);
			}
			node.save(icommand);
		}
	}
};

Node.prototype.validate = function() {
	let valid = true;
	for (let key in this.nodes) {
		let node = this.nodes[key];
		valid = node.validate() && valid;
	}
	return valid;
};

Node.prototype.showMessage = function(message, html = false) {
	this.parent.showMessage(message, html);
};

