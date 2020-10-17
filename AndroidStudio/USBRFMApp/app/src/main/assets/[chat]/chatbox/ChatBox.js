let ChatBox = function(parent) {
	this.parent = parent;
	
	this.tag = document.createElement("div");
	this.tag.className = "ChatBox";

	this.messageBox = new MessageBox(this);
	this.tag.append(this.messageBox.tag);

	this.input = new ChatInput(this);
	this.tag.append(this.input.tag);

	this.onuserinput = async () => {};
};

ChatBox.prototype.userInputReady = async function(text) {
	this.input.set("");
	this.input.enable(false);
	await this.onuserinput(text);
	this.input.enable(true);
	this.input.input.focus();
};

ChatBox.prototype.onMessage = function(message) {
	this.messageBox.add(message)
};

