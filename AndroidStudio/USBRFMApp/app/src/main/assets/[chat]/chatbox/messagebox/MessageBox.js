let MessageBox = function(parent) {
	this.parent = parent;

	this.tag = document.createElement("div");
	this.tag.className = "MessageBox";

	this.rows = [];
	this.line = 0;
};

MessageBox.prototype.add = function(message) {
	let showName = true;
	if (0 < this.rows.length) {
		let lastRow = this.rows[this.rows.length - 1];
		showName = (lastRow.message.from != message.from);
	}

	let messageRow = new MessageRow(this);
	messageRow.set(message, showName, message.own);
	messageRow.tag.style["order"] = -(this.line++);

	this.tag.append(messageRow.tag);
	this.rows.push(messageRow);
};

