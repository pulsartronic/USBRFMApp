#include <CDS.h>


CDS::DataBuffer* CDS::Element::newObject() {
	CDS::DataBuffer* object = new CDS::DynamicBuffer((size_t) 2);
	object->write((size_t) 0, (uint8_t) (CDS::Element::OBJECT | (uint8_t) 1));
	object->write((size_t) 1, (uint8_t) 0);
	return object;
}

CDS::DataBuffer* CDS::Element::newArray() {
	CDS::DataBuffer* array = new CDS::DynamicBuffer((size_t) 2);
	array->write((size_t) 0, (uint8_t) (CDS::Element::ARRAY | (uint8_t) 1));
	array->write((size_t) 1, (uint8_t) 0);
	return array;
}

CDS::DataBuffer* CDS::Element::newNumber() {
	CDS::DataBuffer* number = new CDS::DynamicBuffer((size_t) 3);
	number->write((size_t) 0, (uint8_t) (CDS::Element::BINARY | (uint8_t) 1));
	number->write((size_t) 1, (uint8_t) 1);
	number->write((size_t) 2, (uint8_t) 0);
	return number;
}

CDS::DataBuffer* CDS::Element::newNumber(const uint8_t* name) {
	size_t strsize = strlen((const char*) name);
	uint8_t hml = (uint8_t) 0; while (0 < (strsize >> ++hml * 8));
	CDS::DataBuffer* number = new CDS::DynamicBuffer((size_t) (strsize + 1 + hml));
	number->write((size_t) 0, (uint8_t) (CDS::Element::BINARY | (uint8_t) 1));
	CDS::Number::setChars(number, name);
	return number;
}


bool CDS::Element::valid(CDS::Iterator* iterator) {
	size_t index = iterator->index;
	bool valid = CDS::Element::check(iterator);
	valid = valid && (iterator->index <= iterator->size);
	iterator->index = index;
	return valid;
}

bool CDS::Element::check(CDS::Iterator* iterator) {
	bool valid = true;
	size_t available = iterator->available();
	if (0 < available) {
		uint8_t initial = iterator->read();
		uint8_t ET = initial & CDS::TYPE_MASK;
		uint8_t HMuint8_ts = initial & ~CDS::TYPE_MASK;
		if (0 < HMuint8_ts) {
			available = iterator->available();
			size_t maxHMuint8_ts = sizeof(size_t);
			if (maxHMuint8_ts >= HMuint8_ts && HMuint8_ts <= available) {
				size_t HM = (size_t) 0;
				for (size_t i = (size_t) 0; i < HMuint8_ts; i++) HM = (HM << 8) | ((size_t) iterator->read());
				available = iterator->available();
				if (HM <= available) {
					switch(ET) {
						case CDS::ARRAY: {
							for (size_t i = (size_t) 0; i < HM && valid; i++) {
								valid = valid && CDS::Element::check(iterator);
							}
						} break;
						case CDS::Element::OBJECT:
							for (size_t i = (size_t) 0; i < HM && valid; i++) {
								valid = valid && CDS::Element::check(iterator); // KEY
								valid = valid && CDS::Element::check(iterator); // VALUE
							}
							break;
						case CDS::Element::BINARY: {
							iterator->skip(HM);
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


CDS::DataBuffer* CDS::Element::nextElement(Iterator* iterator) {
	CDS::DataBuffer* element = NULL;
	size_t available = iterator->available();
	if (available) {
		uint8_t initial = iterator->read();
		uint8_t ET = initial & CDS::TYPE_MASK;
		uint8_t HML = initial & ~CDS::TYPE_MASK;
		size_t size = (size_t) 0;
		for (size_t i = (size_t) 0; i < HML; i++) {
			size = (size << 8) | ((size_t) iterator->read());
		}
		iterator->index -= (1 + HML);
		size_t dataSize = ((ET & CDS::BINARY) == CDS::BINARY) ? size : (size_t) 0;
		
		element = iterator->subBuffer((size_t) (1 + HML + dataSize));
		
		CDS::DataBuffer* relement = element;
		switch (ET) {
			case CDS::Element::ARRAY: {
				for (size_t i = (size_t) 0; i < size; i++) {
					CDS::DataBuffer* value = relement->next = CDS::Element::nextElement(iterator);
					value->prev = relement;
					relement = CDS::Element::last(value);
				}
			} break;
			case CDS::Element::OBJECT: {
				for (size_t i = (size_t) 0; i < size; i++) {
					CDS::DataBuffer* key = relement->next = CDS::Element::nextElement(iterator);
					key->prev = relement;
					CDS::DataBuffer* value = key->next = CDS::Element::nextElement(iterator);
					value->prev = key;
					relement = CDS::Element::last(value);
				}
			} break;
			case CDS::Element::BINARY: {
				
			} break;
				
		}
	}
	return element;
}










size_t CDS::Element::hml(CDS::DataBuffer* element) {
	uint8_t ET = element->read((size_t) 0);
	size_t HML = (size_t) (ET & ~CDS::TYPE_MASK);
	return HML;
}

size_t CDS::Element::size(CDS::DataBuffer* element) {
	size_t size = (size_t) 0;
	size_t HML = CDS::Element::hml(element);
	for (size_t i = (size_t) 0; i < HML; i++) {
		uint8_t next = element->read((size_t) (i + 1));
		size = (size << 8) | ((size_t) next);
	}
	return size;
}

bool CDS::Element::isObject(CDS::DataBuffer* element) {
	uint8_t ET = (element->read((size_t) 0) & CDS::TYPE_MASK);
	bool isObject = (ET == CDS::OBJECT);
	return isObject;
}

bool CDS::Element::isArray(CDS::DataBuffer* element) {
	uint8_t ET = (element->read((size_t) 0) & CDS::TYPE_MASK);
	bool isArray = (ET == CDS::ARRAY);
	return isArray;
}

bool CDS::Element::isNumber(CDS::DataBuffer* element) {
	uint8_t ET = (element->read((size_t) 0) & CDS::TYPE_MASK);
	bool isNumber = (ET == CDS::BINARY);
	return isNumber;
}

void CDS::Element::resize(CDS::DataBuffer* element, size_t size) {
	uint8_t ET = (element->read((size_t) 0) & CDS::Element::TYPE_MASK);
	bool isNumber = (ET == CDS::Element::BINARY);
	
	size_t oldHML = CDS::Element::hml(element);
	size_t oldSize = isNumber ? CDS::Element::size(element) : (size_t) 0;
	
	uint8_t newHML = (uint8_t) 0; while (0 < (size >> ++newHML * 8));
	size_t newSize = isNumber ? size : (size_t) 0;
	
	size_t oldTotal = (size_t) (1 + oldHML + oldSize);
	size_t newTotal = (size_t) (1 + newHML + newSize);
	if (oldTotal != newTotal)
		element->resize(newTotal);
	
	element->write((size_t) 0, ET | (newHML & ~CDS::Element::TYPE_MASK));
	for (size_t i = (size_t) 0; i < newHML; i++) {
		uint8_t HMi = (uint8_t) ((size >> 8 * (newHML - i - 1)) & 0xFF);
		element->write((size_t) (i + 1), HMi);
	}
};

CDS::DataBuffer* CDS::Element::last(CDS::DataBuffer* element) {
	size_t size = CDS::Element::size(element);
	
	bool isObject = CDS::Element::isObject(element);
	if (isObject) {
		for (size_t i = (size_t) 0; i < size; i++) {
			element = CDS::Element::last(element->next); // KEY
			element = CDS::Element::last(element->next); // VALUE
		}
	}
	
	bool isArray = CDS::Element::isArray(element);
	if (isArray) {
		for (size_t i = (size_t) 0; i < size; i++) {
			element = CDS::Element::last(element->next);
		}
	}

	return element;
}

void CDS::Element::last(CDS::Iterator* iterator) {
	bool available = iterator->available();
	if (available) {
		uint8_t initial = iterator->read();
		uint8_t ET = initial & CDS::TYPE_MASK;
		size_t hml = (size_t) (initial & ~CDS::TYPE_MASK);
		size_t size = (size_t) 0;
		for (size_t i = (size_t) 0; i < hml; i++) size = (size << 8) | ((size_t) iterator->read());

		bool isObject = (CDS::OBJECT == ET);
		if (isObject) {
			for (size_t i = (size_t) 0; i < size; i++) {
				CDS::Element::last(iterator); // KEY
				CDS::Element::last(iterator); // VALUE
			}
		}
		
		bool isArray = (CDS::ARRAY == ET);
		if (isArray) {
			for (size_t i = (size_t) 0; i < size; i++) {
				CDS::Element::last(iterator);
			}
		}
		
		bool isNumber = (CDS::BINARY == ET);
		if (isNumber) {
			iterator->skip(size);
		}
	}
}

size_t CDS::Element::calculateLength(CDS::DataBuffer* element) {
	size_t length = (size_t) 0;
	if (NULL != element) {
		bool isNumber = CDS::Element::isNumber(element);
		size_t hml = CDS::Element::hml(element);
		size_t size = isNumber ? CDS::Element::size(element) : (size_t) 0;
		length = (size_t) (hml + 1 + size);
		length += CDS::Element::calculateLength(element->next);
	}
	return length;
}

void CDS::Element::serialize(DataBuffer* element, Iterator* iterator) {
	if (NULL != element) {
		bool isNumber = CDS::Element::isNumber(element);
		size_t size = isNumber ? CDS::Element::size(element) : (size_t) 0;
		size_t hml = CDS::Element::hml(element);
		size_t total = (size_t) (1 + hml + size);
		element->serialize(iterator, total);
		CDS::Element::serialize(element->next, iterator);
	}
};

CDS::DataBuffer* CDS::Element::replace(DataBuffer* element, DataBuffer* newElement) {
	if (element != newElement) {
	// TODO::
	/*
		CDS::DataBuffer* oprev = element->prev;
		CDS::DataBuffer* olast = CDS::Element::last(element);
		CDS::DataBuffer* onext = olast->next;
		
		CDS::DataBuffer* nprev = newElement->prev;
		CDS::DataBuffer* nlast = CDS::Element::last(newElement);
		CDS::DataBuffer* nnext = nlast->next;
		
		oprev->next = newElement;
		newElement->prev = oprev;
		
		nlast->next = onext;
		if (NULL != onext) onext->prev = nlast;
		
		*/
	}
	return NULL;
}

void CDS::Element::fill(CDS::Iterator storage, CDS::DataBuffer* element) {
	size_t size = CDS::Element::size(element);
	
	bool isObject = CDS::Element::isObject(element);
	if (isObject) {
		for (size_t i = (size_t) 0; i < size; i++) {
			CDS::DataBuffer* key = CDS::Object::key(element, i);
			CDS::DataBuffer* value = key->next;
			CDS::Iterator childStorage = CDS::Object::taketo(storage, key);
			CDS::Element::fill(childStorage, value);
		}
	}
	
	bool isArray = CDS::Element::isArray(element);
	if (isArray) {
		for (size_t i = (size_t) 0; i < size; i++) {
			CDS::DataBuffer* value = CDS::Array:: get(element, i);
			CDS::Iterator childStorage = CDS::Array::taketo(storage, i);
			CDS::Element::fill(childStorage, value);
		}
	}
	
	bool isNumber = CDS::Element::isNumber(element);
	if (isNumber) {
		CDS::DataBuffer* saved = CDS::Element::nextElement(&storage);
		if (NULL != saved) {
			CDS::Number::setData(saved, element);
		}
		delete saved;
	}
}

/*
String CDS::Element::stringify(CDS::DataBuffer* element) {
	String str = "";
	if (NULL != element) {
		size_t size = CDS::Element::size(element);
		if (CDS::Element::isObject(element)) {
			str += "{";
			for (size_t i = (size_t) 0; i < size; i++) {
				str += "\"";
				CDS::DataBuffer* key = element->next;
				size_t keySize = CDS::Element::size(key);
				size_t hml = CDS::Element::hml(key);
				for (size_t j = (size_t) 0; j < keySize; j++) {
					str += (char) key->read(1 + hml + j);
				}
				str += "\":" + CDS::Element::stringify(key->next);
				element = CDS::Element::last(key->next);
				if (i < (size - 1)) str += ",";
			}
			str += "}";
		} else if (CDS::Element::isArray(element)) {
			str += "[";
			for (size_t i = (size_t) 0; i < size; i++) {
				str += CDS::Element::stringify(element->next);
				element = CDS::Element::last(element->next);
				if (i < (size - 1)) str += ",";
			}
			str += "]";
		} else if (CDS::Element::isNumber(element)) {
			str += "\"";
			size_t keySize = CDS::Element::size(element);
			size_t hml = CDS::Element::hml(element);
			for (size_t j = (size_t) 0; j < keySize; j++) {
				str += String(element->read(1 + hml + j), 16);
			}
			str += "\"";
		}
	}
	return str;
}
*/

