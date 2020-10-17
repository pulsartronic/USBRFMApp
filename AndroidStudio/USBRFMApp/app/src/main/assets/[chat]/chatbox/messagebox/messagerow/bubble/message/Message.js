let Message = function(parent) {
	this.parent = parent;

	this.tag = document.createElement("div");
	this.tag.className = "Message";
};

Message.prototype.set = function(text) {
	this.tag.textContent = text;
};
