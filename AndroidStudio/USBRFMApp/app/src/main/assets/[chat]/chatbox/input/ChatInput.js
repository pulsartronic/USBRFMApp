let ChatInput = function(parent) {
	this.parent = parent;

	this.tag = document.createElement("div");
	this.tag.className = "ChatInput";

	this.input = document.createElement("input");
	this.input.type = "text";
	this.input.onkeypress = this.onkeypress.bind(this);
	this.tag.append(this.input);
	
	this.button = document.createElement('div');
	this.tag.append(this.button);
	this.button.className = 'Button SendButton';
	this.button.textContent = '\u25BA';
	this.button.onclick = this.userInputReady.bind(this);
};

ChatInput.prototype.enable = function(enabled) {
	this.input.disabled = !enabled;
};

ChatInput.prototype.set = function(text) {
	this.input.value = text;
};

ChatInput.prototype.onkeypress = async function(e) {
	switch(e.keyCode) {
		case 13: {
			this.userInputReady();
		} break;
	}
};

ChatInput.prototype.userInputReady = async function(e) {
	let text = this.input.value.trim();
	if (0 < text.length) {
		await this.parent.userInputReady(text);
	}
};

