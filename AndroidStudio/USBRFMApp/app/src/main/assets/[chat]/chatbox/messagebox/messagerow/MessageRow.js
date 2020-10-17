let MessageRow = function(parent) {
	this.parent = parent;

	this.tag = document.createElement("div");
	this.tag.className = "MessageRow";

	this.bubble = new Bubble(this);
	this.tag.append(this.bubble.tag);

	this.message = null;
};

MessageRow.prototype.set = function(message, showName, own) {
	this.message = message;
	this.bubble.set(message, showName, own);
	
	this.tag.style['flex-direction'] = own ? 'row-reverse' : 'row';
};

