///////////////////////////////////////////////////////////////////////////////////
// Console
let Console = function(parent) {
	this.parent = parent;

	this.tag = document.createElement('div');
	this.tag.className = 'Console';

	this.length = 0;
	this.lines = 0;
	this.elements = [];
};

Console.MAX_LINES = 40;

Console.prototype.init = function(data) {

};

Console.prototype.addTextLine = function(text) {
	let lineElement = null;

	if (Console.MAX_LINES > this.length) {
		this.length += 1;
		lineElement = document.createElement('div');
		lineElement.className = 'Line';
		this.tag.append(lineElement);
		this.elements.push(lineElement);
	} else {
		let index = (this.lines % this.length);
		lineElement = this.elements[index];
	}

	lineElement.textContent = text;
	lineElement.style['order'] = -(this.lines++);
};

Console.prototype.pong = function(pong) {

};





