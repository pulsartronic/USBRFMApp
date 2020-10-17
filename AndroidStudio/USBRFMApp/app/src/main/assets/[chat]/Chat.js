///////////////////////////////////////////////////////////////////////////////////
// Chat
let Chat = function(parent, name) {
	Node.call(this, parent, name);

	this.tag = document.createElement('div');
	this.tag.className = 'Chat';
	this.tag.node = this;

	this.chatbox = new ChatBox();
	this.tag.append(this.chatbox.tag);
	this.chatbox.onuserinput = this.onuserinput.bind(this);
	
	this.id = 0;
};

// Inheritance
for (let i in Node.prototype)
	Chat.prototype[i] = Node.prototype[i];


Chat.prototype.init = function(data) {
	
};

Chat.prototype.onuserinput = function(text) {
	this.parent.onuserinput(text);
};

Chat.prototype.onmessage = function(message) {
	this.chatbox.onMessage(message);
};

Chat.prototype.sent = function(params) {
	console.log(CDOS.stringify(params));
};

