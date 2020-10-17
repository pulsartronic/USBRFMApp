let Bubble = function(parent) {
	this.parent = parent;

	this.tag = document.createElement("div");
	this.tag.className = "Bubble";

	this.name = new Name(this);
	this.tag.append(this.name.tag);

	this.message = new Message(this);
	this.tag.append(this.message.tag);
};

Bubble.prototype.set = function(message, showName, own) {
	let method = showName ? this.tag.classList.remove : this.tag.classList.add;
	method.call(this.tag.classList, "NamedBubble");
	this.tag.classList[(showName && !own) ? 'add' : 'remove']('NamedBubble');
	this.tag.classList[own ? 'add' : 'remove']('OwnBubble');

	//let name = message.from.substring(message.from.length - 10, message.from.length);
	this.name.set(message, showName && !own);

	this.message.set(message.text);
};
