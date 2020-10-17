// ///////////////////////////////////////////////////////////////////////////////
// AESM
// https://github.com/ricmoo/aes-js
//
// Browser crypto can be scary. Do you have an evil extension 
// installed? We can't tell. Further, have we been tortured 
// into serving you custom, targeted JavaScript? Hopefully 
// you're not that important.
// So: only use this page if (1) you feel your browser is 
// clean and (2) a life doesn't depend on it.

let AESM = function(key) {
	this.encoder = new TextEncoder('UTF-8');
	this.decoder = new TextDecoder('UTF-8');

	let keyBuffer = key.b16ToAB();//this.encoder.encode(key);
	this.key = new Uint8Array(keyBuffer);
};

AESM.prototype.encrypt = function(buffer) {
	var iv = new Uint8Array(16);
	window.crypto.getRandomValues(iv);
	let bytes = aesjs.padding.pkcs7.pad(buffer);
	var aesCbc = new aesjs.ModeOfOperation.cbc(this.key, iv);
	var encryptedBytes = aesCbc.encrypt(bytes);
	var ebuffer = new Uint8Array(iv.length + encryptedBytes.length);
	ebuffer.set(iv);
	ebuffer.set(encryptedBytes, iv.length);
	return ebuffer;
};

AESM.prototype.decrypt = function(ebuffer) {
	var iv = new Uint8Array(ebuffer.buffer, 0, 16);
	let edata = new Uint8Array(ebuffer.buffer, 16);
	var aesCbc = new aesjs.ModeOfOperation.cbc(this.key, iv);
	let decryptedBytes = aesCbc.decrypt(edata);
	let buffer = aesjs.padding.pkcs7.strip(decryptedBytes);
	return buffer;
};

/*
AESM.prototype.encrypt = function(text) {
	var iv = new Uint8Array(16);
	window.crypto.getRandomValues(iv);
	let textBytes = aesjs.padding.pkcs7.pad(this.encoder.encode(text));
	var aesCbc = new aesjs.ModeOfOperation.cbc(this.key, iv);
	var encryptedBytes = aesCbc.encrypt(textBytes);
	var encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
	var c = new Int8Array(iv.length + encryptedBytes.length);
	c.set(iv);
	c.set(encryptedBytes, iv.length);
	let edata = c.buffer.toB64();
	return edata;
};

AESM.prototype.decrypt = function(encrypted64) {
	let buffer = encrypted64.b64ToAB();
	var iv = new Uint8Array(buffer, 0, 16);
	let edata = new Uint8Array(buffer, 16);
	var aesCbc = new aesjs.ModeOfOperation.cbc(this.key, iv);
	let decryptedBytes = aesCbc.decrypt(edata);
	let paddedData = aesjs.padding.pkcs7.strip(decryptedBytes);
	let data = this.decoder.decode(paddedData);
	return data;
};
*/
