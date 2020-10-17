ArrayBuffer.prototype.toB64 = function(url = false) {
	let base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' + (url ? '-_' : '+/');
	let str = '', ui8 = new Uint8Array(this);
	for (let i = 0, b = 0; i < ui8.length; i++) {
		let ui = ui8[i], le = 2 * (i % 3), p = 2 + le, na = (ui >> p);
		str += base64Chars[na | b];
		let p2 = 2**p - 1, ml = (4 - le);
		b = (ui & p2) << ml;
		if (0 == ml || i == (ui8.length - 1)) {
			str += base64Chars[b];
			b = 0;
		}
	}
	while (!url && (str.length & 3) > 0) str += '=';
	return str;
};

ArrayBuffer.prototype.toB16 = function() {
	let str = '';
	let uia = new Uint8Array(this);
	for (let ui of uia) {
		let b16 = ui.toString(16);
		str += b16.padStart(2, '0');
	}
	return str;
};

String.prototype.b64ToAB = function(url = false) {
	let base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' + (url ? '-_' : '+/');
	let str = this.replace(/=/gi, '');
	let length = Math.floor(str.length * 6 / 8);
	let arrayBuffer = new ArrayBuffer(length);
	let uia = new Uint8Array(arrayBuffer);
	for (let i = 0, si = -1; i < length; i++) {
		let m = 2 * (i % 3), e1 = 6 - m, b1 = 2**e1 - 1;
		si += +(0 == i % 3);
		let c = str[si], ci1 = base64Chars.indexOf(c);
		uia[i] = (ci1 & b1) << (2 + m);
		let e2 = 4 - m, b2 = 63 - (2**e2 - 1), c2 = str[++si] || 'A', ci2 = base64Chars.indexOf(c2);
		uia[i] |= (ci2 & b2) >> (4 - m);
	}
	return arrayBuffer;
};

String.prototype.b16ToAB = function() {
	let str = (0 == (this.length % 2)) ? this : ('0' + this);
	let arrayBuffer = new ArrayBuffer(str.length / 2);
	let uia = new Uint8Array(arrayBuffer);
	for (let j = 0; j < uia.length; j++) {
		let s = str.substring(2 * j, 2 * j + 2);
		uia[j] = parseInt(s, 16);
	}
	return arrayBuffer;
};

String.prototype.JWK = async function() {
	let promise = new Promise((resolve, reject) => {
		let worker = new Worker('lib/crypto/JwkGenerator.js?v=1');
		worker.onmessage = function(e) {
			resolve(e.data);
			this.terminate();
		};
		worker.postMessage(this);
	});
	return promise;
};


Number.prototype.battery = function() {
	let bin3v3 = 1024;
	let binMax = 3.9 * bin3v3 / 3.3;
	let binMin = 3.5 * bin3v3 / 3.3;
	let range = binMax - binMin;
	let read = 2 * this - binMin;
	let percentage = Math.max(0, Math.min(100 * (read / range), 100));
	return percentage;
};

Number.prototype.mod = function(n) {
	return ((this % n) + n) % n;
};

