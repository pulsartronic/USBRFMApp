class CDElement {
	length() { return 0; }
	size() { return 0; }
	add(element) {}
	get(index) { return null; }
	set(index, element) { }
	// get(char* name) { return null; } 
	// let(name, element) { }
	calculateLength() { return 0; }
	serialize(iterator) { }

	uint8()  { return 0;}
	int8()   { return 0;}
	int16()  { return 0;}
	uint16() { return 0;}
	int32()  { return 0;}
	uint32() { return 0;}
	int64()  { return 0;}
	uint64() { return 0;}

	base64() {
		let size = this.calculateLength();
		let ui8buffer = new Uint8Array(size);
		let iterator = new CDIterator(ui8buffer, size);
		this.serialize(iterator);
		let b64 = ui8buffer.buffer.toB64();
		return b64;
	}
};

CDElement.CD_TYPE_FLAGS  = 192; // 11000000
CDElement.CD_OBJECT_TYPE = 64;
CDElement.CD_ARRAY_TYPE  = 128;
CDElement.CD_BINARY_TYPE = 192;


class CDIterator {

	constructor(buffer, size) {
		this.buffer = buffer;
		this.size = size;
		this.index = 0;
	}

	reset() {
		this.index = 0;
	}

	nextElement() {
		let element = null;
		let available = this.available();
		if (0 < available) {
			let initial = this.next();
			let ET = initial & CDElement.CD_TYPE_FLAGS;
			let HMbytes = initial & ~CDElement.CD_TYPE_FLAGS;
			if (0 < HMbytes) {
				available = this.available();
				// this implementation stores numbers as primitives, thus we have to check against
				// the best type available, considering the platform
				let maxHMbytes = 2;//sizeof(let);
				if (maxHMbytes >= HMbytes && HMbytes <= available) {
					let HM = this.parseNumber(HMbytes);
					switch(ET) {
						case CDElement.CD_ARRAY_TYPE: {
							element = new CDArray(HM, this);
						} break;
						case CDElement.CD_OBJECT_TYPE: {
							element = new CDObject(HM, this);
						} break;
						case CDElement.CD_BINARY_TYPE: {
							element = new CDNumber(HM, this);
						} break;
					}
				}
			}
		}
		return element;
	}

	parseNumber(HMbytes) {
		let number = 0;
		for (let i = 0; i < HMbytes; i++) {
			let next = this.next();
			number = number << 8;
			number |= next;
		}
		return number;
	}

	valid() {
		let valid = this.check();
		valid = valid && (this.index == this.size);
		this.index = 0;
		return valid;
	}

	check() {
		let valid = true;
		let available = this.available();
		if (0 < available) {
			let initial = this.next();
			let ET = initial & CDElement.CD_TYPE_FLAGS;
			let HMbytes = initial & ~CDElement.CD_TYPE_FLAGS;
			if (0 < HMbytes) {
				available = this.available();
				// this implementation stores numbers as primitives, thus we have to check against
				// the best type available, considering the platform
				let maxHMbytes = 2;//sizeof(uint16_t);
				if (maxHMbytes >= HMbytes && HMbytes <= available) {
					let HM = this.parseNumber(HMbytes);
					available = this.available();
					if (HM <= available) {
						switch(ET) {
							case CDElement.CD_ARRAY_TYPE: {
								for (let i = 0; i < HM && valid; i++) {
									valid = valid && this.check();
								}
							} break;
							case CDElement.CD_OBJECT_TYPE:
								for (let i = 0; i < HM && valid; i++) {
									valid = valid && this.check(); // KEY
									valid = valid && this.check(); // VALUE
								}
								break;
							case CDElement.CD_BINARY_TYPE: {
								this.index += HM;
							} break;
							default: {
								valid = false;
							} break;
						}
					} else {
						valid = false;
					}
				} else {
					valid = false;
				}
			}
		} else {
			valid = false;
		}
		return valid;
	}

	available() {
		let available = (this.size >= this.index) ? (this.size - this.index) : 0;
		return available;
	}

	hasNext() {
		return (this.index < this.size);
	}

	next() {
		let index = this.index;
		this.index += ((index + 1) > this.size) ? 0 : 1;
		return this.buffer[index];
	}

	add(value) {
		let hasNext = this.hasNext();
		if (hasNext) {
			this.buffer[this.index++] = value;
		} else {
			console.log('Error in serialization');
		}
	}
};




class CDArray extends CDElement {
	constructor(HM, iterator) {
		super();

		this.elements = [];

		if (HM && iterator) {
			let available = iterator.available();
			for (let i = 0; (i < HM) && (0 < available); i++) {
				let nextElement = iterator.nextElement();
				this.add(nextElement);
				available = iterator.available();
			}
		}
	}

	length() {
		return this.elements.length;
	}

	get(index) {
		return this.elements[index];
	}

	set(index, element) {
		this.elements[index] = element;
	}

	add(element) {
		this.elements.push(element);
	}

	calculateLength() {
		let blength = 2; // ET + HM 
		for (let i = 0; i < this.elements.length; i++) {
			let element = this.elements[i];
			if (null != element) {
				blength += element.calculateLength();
			} else {
				blength += 1;
			}
		}
		return blength;
	}

	serialize(iterator) {
		let ET = CDElement.CD_ARRAY_TYPE | 1;
		iterator.add(ET);
		let HM = this.elements.length;
		iterator.add(HM);
		for (let i = 0; i < this.elements.length; i++) {
			let element = this.elements[i];
			if (null != element) {
				element.serialize(iterator);
			} else { // indicate NULL
				let ET = CDElement.CD_OBJECT_TYPE | 0;
				iterator.add(ET);
			}
		}
	}
};


class CDKeyValue {
	constructor(name, value, iterator) {
		//super(name, iterator);
		if (value) {
			this.key = new CDNumber(name);
			this.value = value;
		} else {
			this.key = new CDNumber(name, iterator);
			this.value = iterator.nextElement();
		}
	}

	calculateLength() {
		let blength = this.key.calculateLength();
		if (null != this.value) {
			blength += this.value.calculateLength();
		} else {
			blength += 1; // to indicate NULL
		}

		return blength;
	}

	serialize(iterator) {
		this.key.serialize(iterator);
		if (null != this.value) {
			this.value.serialize(iterator);
		} else { // indicate NULL
			let ET = CDElement.CD_OBJECT_TYPE | 0;
			iterator.add(ET);
		}
	}
};

class CDObject extends CDElement {

	constructor(HM, iterator) {
		super();

		this.keys = {};

		if (HM && iterator) { 
			let available = iterator.available();
			for (let i = 0; (i < HM) && (0 < available); i++) {
				let initial = iterator.next();
				let ET = initial & CDElement.CD_TYPE_FLAGS;
				if (CDElement.CD_BINARY_TYPE == ET) {
					let HMbytes = initial & ~CDElement.CD_TYPE_FLAGS;
					available = iterator.available();
					let maxHMbytes = 2;//sizeof(let);			
					if (maxHMbytes >= HMbytes && HMbytes <= available) {
						let HM = iterator.parseNumber(HMbytes);
						available = iterator.available();
						if (0 < HM && HM <= available) {
							// TODO:: check for existance before creating a new one
							let keyValue = new CDKeyValue(HM, null, iterator);
							this.keys[`${CDOS.decoder.decode(keyValue.key.bytes)}`] = keyValue;
						}
					}
				}
			}
		}
	}

	size() {
		return Object.keys(this.keys).length;
	}

	getKey(name) {
		return this.keys[name];
	}

	get(name) {
		let element = null;
		let skey = this.getKey(name);
		if (null != skey) {
			element = skey.value;
		}
		return element;
	}

	set(name, element) {
		this.keys[name] = new CDKeyValue(name, element);
	}

	newObject(name) {
		let newObject = new CDObject();
		this.set(name, newObject);
		return newObject;
	}
	
	newArray(name) {
		let newArray = new CDArray();
		this.set(name, newArray);
		return newArray;
	}
	
	newNumber(name) {
		let newNumber = new CDNumber();
		this.set(name, newNumber);
		return newNumber;
	}
	
	string(name) {
		let newString = new CDString();
		this.set(name, newString);
		return newString;
	}

	calculateLength() {
		let blength = 2; // ET + HM
		for (let i in this.keys) {
			let key = this.keys[i];
			if (null != key) { // it should be never NULL
				blength += key.calculateLength();
			}
		}
		return blength;
	}

	serialize(iterator) {
		let ET = CDElement.CD_OBJECT_TYPE | 1;
		iterator.add(ET);
		let HM = this.size();
		iterator.add(HM);
		for (let i in this.keys) {
			let key = this.keys[i];
			if (null != key) {
				key.serialize(iterator);
			} // TODO:: indicate null key ?? it should never happen
		}
	}
};


class CDNumber extends CDElement {

	constructor(HM, iterator) {
		super();

		if (HM && iterator) {
			this.bytes = new Uint8Array(HM);
			let available = iterator.available();
			if (HM <= available) {				
				for (let i = 0; i < HM; i++) {
					this.bytes[i] = iterator.next();
				}
			}
		} else if (HM) {
			let encoder = new TextEncoder('UTF-8');
			this.bytes = encoder.encode(HM);
		}
	}

	string() {
		return CDOS.decoder.decode(this.bytes);
	}

	setBuffer(buffer) {
		this.bytes = buffer;
	}
	
	utype(size, value) {
		this.bytes = new Uint8Array(size);
		for (let i = 0; i < size; i++) {
			let dvalue = value >> (8 * (size - i - 1));
			this.bytes[i] = dvalue & 0xFF;
		}
	}

	setUInt8(uint8) {
		this.utype(1, uint8);
	}

	setUInt16(uint16) {
		this.utype(2, uint16);
	}

	setUInt32(uint32) {
		this.utype(4, uint32);
	}

/*
	setInt8(uint8) {
		let uintArray = new Uint8Array(4);
		let dataview = new DataView(uintArray.buffer);
		dataview.setUint8(uint8);
		setBytes(uintArray, 4);
	}

	setInt16(uint16) {
		let uintArray = new Uint8Array(8);
		let dataview = new DataView(uintArray.buffer);
		dataview.setUint16(uint16);
		setBytes(uintArray, 2);
	}

	setInt32(uint32) {
		let uintArray = new Uint8Array(8);
		let dataview = new DataView(uintArray.buffer);
		dataview.setUint32(uint32);
		setBytes(uintArray, 4);
	}
*/
	uint() {
		let typesize = 8 * this.bytes.length;
		let dataView = new DataView(this.bytes.buffer);
		let ret = 0;
		switch(typesize) {
			case 8:  ret = dataView.getUint8();  break;
			case 16: ret = dataView.getUint16(); break;
			case 32: ret = dataView.getUint32(); break;
		}
		return ret;
	}

	int() {
		let typesize = 8 * this.bytes.length;
		let dataView = new DataView(this.bytes.buffer);
		let ret = 0;
		switch(typesize) {
			case 8:  ret = dataView.getInt8();  break;
			case 16: ret = dataView.getInt16(); break;
			case 32: ret = dataView.getInt32(); break;
		}
		return ret;
	}

	float() {
		let typesize = 8 * this.bytes.length;
		let dataView = new DataView(this.bytes.buffer);
		let ret = 0;
		switch(typesize) {
			case 32: ret = dataView.getFloat32(); break;
			case 64: ret = dataView.getFloat64(); break;
		}
		return ret;
	}

	calculateLength() {
		let blength = 2 + this.bytes.length;
		return blength;
	}

	serialize(iterator) {
		let ET = CDElement.CD_BINARY_TYPE | 1;
		iterator.add(ET);
		let HM = this.bytes.length;
		iterator.add(HM);
		for (let i = 0; i < this.bytes.length; i++) {
			let v = this.bytes[i];
			iterator.add(v);
		}
	}
};


let CDOS = {};
CDOS.encoder = new TextEncoder('UTF-8');
CDOS.decoder = new TextDecoder('UTF-8');

CDOS.stringify = function(element) {
	let str = '';
	if (!element) {
		str += 'null';
	} else if (element instanceof CDObject) {
		str += `{`;
		let strs = [];
		for (let i in element.keys) {
			let keyValue = element.keys[i];
			let kstr = `"${CDOS.decoder.decode(keyValue.key.bytes)}":`;
			kstr += CDOS.stringify(keyValue.value);
			strs.push(kstr);
		}
		str += strs.join(',') + `}`;
	} else if (element instanceof CDArray) {
		str += `[`;
		let strs = [];
		for (let i = 0; i < element.elements.length; i++) {
			let child = element.elements[i];
			let kstr = CDOS.stringify(child);
			strs.push(kstr);
		}
		str += strs.join(',') + `]`;
	} else if (element instanceof CDNumber) {
		str += `"0x`;
		for (let i = 0; i < element.bytes.length; i++) {
			let byte = element.bytes[i];
			str += byte.toString(16).padStart(2, '0');
		}
		str += `"`;
	}
	return str;
};




