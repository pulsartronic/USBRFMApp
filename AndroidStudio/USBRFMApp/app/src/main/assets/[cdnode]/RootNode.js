///////////////////////////////////////////////////////////////////////////////////
// RootNode
let RootNode = function(parent, name) {
	Node.call(this, parent, name);

	this.aes = null;
	this.jlid = null;
	this.syncID = 0;
	this.errors = 0;
};

for (let i in Node.prototype)
	RootNode.prototype[i] = Node.prototype[i];

RootNode.prototype.onLoggedin = function() {};
RootNode.prototype.onConnected = function() {};
RootNode.prototype.onLoginError = function() {};
RootNode.prototype.onSynced = function() {};
RootNode.prototype.onErrorSyncing = function() {};
// RootNode.prototype.oncommand = function(command) {};
RootNode.prototype.onLoggedOut = function() {};
RootNode.prototype.reconnectTimeout = null;

RootNode.prototype.init = function() {
	// this.requestJLID();
};

RootNode.prototype.setJLID = function(jlid) {
	this.jlid = jlid;
	this.syncID = this.jlid.l - Date.now() + 1;
};

RootNode.prototype.getJLID = function() {
	let jlid = {};
	jlid.b = this.jlid.b;
	jlid.l = this.syncID + Date.now();
	return jlid;
};

RootNode.prototype.requestJLID = function() {
    //this.sendRequest('/s', '', this.onjlid.bind(this));
};

RootNode.prototype.onjlid = function(response) {
	if (!response.error) {
		let jlid = JSON.parse(response);
		this.setJLID(jlid);
		this.onSynced();
	} else {
		console.log('error syncing, trying again ...');
		console.log(response);
		setTimeout(this.requestJLID.bind(this), 2 * 1000);
	}
};

RootNode.prototype.okClicked = function() {
	if (this.jlid) {
		if (this.changeButton.showing) {
			this.change();
		} else {
			this.login();
		}
	}
};

RootNode.prototype.signin = function(user, pass) {
	let hash = Sha256.hash(user + pass);
	this.hsignin(hash);
};

RootNode.prototype.hsignin = function(hash) {
	this.aesm = new AESM(hash);
	this.connection.init();
	// this.httpCommand({'login':{}}, this.loggedin.bind(this));
};

RootNode.prototype.change = function(user, pass, newUser, newPass) {
		let hash = Sha256.hash(user + pass);
		this.aesm = new AESM(hash);

		let newHash = Sha256.hash(newUser + newPass);
		let newKey = newHash.b16ToAB().toB64();

		let params = {};
		params.key = newKey;

		this.httpCommand({'change':params}, this.loggedin.bind(this));
		this.aesm = new AESM(newHash);
};

RootNode.prototype.loggedin = function(response) {
	try {
		let dataSTR = this.aesm.decrypt(response);
		console.log(dataSTR);
		let commands = JSON.parse(dataSTR);
		switch(commands[0].error) {
			case 1:
				this.setJLID(commands[0].jlid);
				this.onLoginError();
				break;
			default:
				this.wport = commands[0].wport;
				this.onLoggedin(commands[0]);
				this.connect();
				break;
		}
	} catch(e) {
		this.onLoginError();
		console.error(e, e.stack);
	}
};

RootNode.prototype.httpCommand = async function(params, callback) {
	let command = {};
	command.id = this.getJLID();
	command.p = params;
	let commandSTR = JSON.stringify(command);
	let edata = this.aesm.encrypt(commandSTR);
	this.sendRequest('/u', edata, callback);
};

RootNode.prototype.sendRequest = function(path, data = '', callback) {
	let encodedData = encodeURIComponent(data);
	let request = new XMLHttpRequest();
	request.open('GET', `http://${this.host}:${this.hport}${path}?d=${encodedData}`);
	request.onreadystatechange = () => {
		if (4 == request.readyState) {
			if (200 == request.status) {
             try {
					// let response = JSON.parse(request.responseText);
					callback(request.responseText);
             } catch(e) {
                 let response = {};
                 response.error = 4;
                 response.cause = e;
                 callback(response);
             }
			}
		}
	};

	request.onerror = (e) => {
		console.log('Network error, trying again ...');
		this.errors += 1;
		if (5 >= this.errors) {
			setTimeout(this.sendRequest.bind(this, path, data, callback), 3 * 1000);
		} else {
			this.logout();
		}
	};

	request.send();
};

RootNode.prototype.command = function(params) {
	console.log(params);
	if (this.socket && WebSocket.OPEN == this.socket.readyState) {
		let command = {};
		command.id = this.getJLID();
		command.p = params;
		let commandSTR = JSON.stringify(command);
		let edata = this.aesm.encrypt(commandSTR);
		this.socket.send(edata);
	} else {
		this.httpCommand(params, (responseText) =>{
			try {
				let dataSTR = this.aesm.decrypt(responseText);
				console.log(dataSTR);
				let commands = JSON.parse(dataSTR);
				for (let command of commands) {
					this.execute(command);
				}
			} catch(e) {
				//this.logout();
				console.error(e, e.stack);
			}
		});
	}
};

RootNode.prototype.userCommand = function(params) {
	this.command(params);
};

RootNode.prototype.logout = function() {
	this.errors = 0;
	clearTimeout(this.reconnectTimeout);
	this.onLoggedOut();
	try {
		if (this.socket) {
			this.socket.onclose = () => {};
			this.socket.close();
		}
	} catch(e) {
		console.error(e, e.stack);
	}
};

RootNode.prototype.connect = function() {
	try {
		clearTimeout(this.reconnectTimeout);
		this.socket = new WebSocket(`ws://${this.host}:${this.wport}/`, ['arduino']);
		this.socket.onopen = this.onopen.bind(this);
		this.socket.onerror = this.onerror.bind(this);
		this.socket.onmessage = this.onmessage.bind(this);
		this.socket.onclose = this.onclose.bind(this);
	} catch(e) {
		console.error(e, e.stack);
	}
};

RootNode.prototype.onopen = function() {
	//console.log('onopen :::');
	this.onConnected();
};

RootNode.prototype.onerror = function(error) {
	//console.log('error :::');
};

RootNode.prototype.onclose = function(e) {
	//console.log('onclose :::');
	clearTimeout(this.reconnectTimeout);
	this.reconnectTimeout = setTimeout(this.connect.bind(this), 3 * 1000);
};

RootNode.prototype.onmessage = function(e) {
	try {
		let dataSTR = this.aesm.decrypt(e.data);
		console.log(dataSTR);
		let command = JSON.parse(dataSTR);
		this.execute(command);
	} catch(e) {
		console.error(e, e.stack);
	}
};

RootNode.prototype.execute = function(command) {
	switch(command.error) {
		case 1:
			this.errors += 1;
			if (5 >= this.errors) {
				this.setJLID(command.jlid);
				console.log('Error on user command, trying again ...');
				setTimeout(this.userCommand.bind(this, command.c), 1000);
			} else {
				this.logout();
			}
			break;
		default:
			//console.log("RESP:");
			//console.log(dataSTR);
			this.errors = 0;
			this.oncommand(command);
			break;
	}
};

