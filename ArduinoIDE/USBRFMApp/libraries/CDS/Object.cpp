#include <CDS.h>


CDS::DataBuffer* CDS::Object::newObject(CDS::DataBuffer* object, const uint8_t* name) {
	CDS::DataBuffer* newObject = CDS::Element::newObject();
	CDS::Object::set(object, name, newObject);
	return newObject;
}

CDS::DataBuffer* CDS::Object::newArray(CDS::DataBuffer* object, const uint8_t* name) {
	CDS::DataBuffer* newArray = CDS::Element::newArray();
	CDS::Object::set(object, name, newArray);
	return newArray;
}

CDS::DataBuffer* CDS::Object::newNumber(CDS::DataBuffer* object, const uint8_t* name) {
	CDS::DataBuffer* newNumber = CDS::Element::newNumber();
	CDS::Object::set(object, name, newNumber);
	return newNumber;
}

CDS::DataBuffer* CDS::Object::key(DataBuffer* object, size_t index) {
	CDS::DataBuffer* key = object->next;
	for (size_t i = (size_t) 0; i < index; i++) {
		CDS::DataBuffer* last = CDS::Element::last(key->next);
		key = last->next;
	}
	return key;
}

CDS::DataBuffer* CDS::Object::get(DataBuffer* object, const uint8_t* name) {
	CDS::DataBuffer* element = NULL;
	size_t size = CDS::Element::size(object);
	for (size_t i = (size_t) 0; i < size; i++) {
		CDS::DataBuffer* key = CDS::Object::key(object, i);
		bool equals = CDS::Number::cmp(key, name);
		if (equals) {
			element = key->next;
			break;
		}
	}
	return element;
}

void CDS::Object::set(DataBuffer* object, const uint8_t* name, CDS::DataBuffer* value) {
	// TODO:: check for key existance !!!
	// CDS::DataBuffer* saved = CDS::Object::get(object, name);
	
	CDS::DataBuffer* last = CDS::Element::last(value);
	CDS::DataBuffer* prev = CDS::Element::last(object);
	CDS::DataBuffer* next = prev->next;
	
	CDS::DataBuffer* key = CDS::Element::newNumber();
	CDS::Number::setChars(key, name);
	
	key->prev = prev;
	prev->next = key;
	
	value->prev = key;
	key->next = value;
	
	last->next = next;
	if (NULL != next) next->prev = last;
	
	size_t size = CDS::Element::size(object);
	CDS::Element::resize(object, (size_t) (size + 1));
}


CDS::Iterator CDS::Object::taketo(CDS::Iterator storage, const uint8_t* name) {
	// TODO:: there is no check against CDS::OBJECT
	uint8_t initial = storage.read();
	size_t size = storage.readSize(initial);
	
	for (size_t i = (size_t) 0; i < size; i++) {
		CDS::DataBuffer* key = CDS::Element::nextElement(&storage);
		bool equals = CDS::Number::cmp(key, name);
		delete key;
		if (equals) {
			break;
		} else {
			CDS::Element::last(&storage);
		}
	}
	return storage;
}

CDS::Iterator CDS::Object::taketo(CDS::Iterator storage, CDS::DataBuffer* key) {
	// TODO:: there is no check against CDS::OBJECT
	uint8_t initial = storage.read();
	size_t size = storage.readSize(initial);
	for (size_t i = (size_t) 0; i < size; i++) {
		CDS::DataBuffer* storedKey = CDS::Element::nextElement(&storage);
		bool equals = CDS::Number::cmp(key, storedKey);
		delete storedKey;
		if (equals) {
			break;
		} else {
			CDS::Element::last(&storage);
		}
	}
	return storage;
}



