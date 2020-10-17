#include <CDS.h>


CDS::DataBuffer* CDS::Array::newObject(CDS::DataBuffer* array) {
	CDS::DataBuffer* newObject = CDS::Element::newObject();
	CDS::Array::add(array, newObject);
	return newObject;
}

CDS::DataBuffer* CDS::Array::newArray(CDS::DataBuffer* array) {
	CDS::DataBuffer* newArray = CDS::Element::newArray();
	CDS::Array::add(array, newArray);
	return newArray;
}

CDS::DataBuffer* CDS::Array::newNumber(CDS::DataBuffer* array) {
	CDS::DataBuffer* newNumber = CDS::Element::newNumber();
	CDS::Array::add(array, newNumber);
	return newNumber;
}

CDS::DataBuffer* CDS::Array::add(CDS::DataBuffer* array, CDS::DataBuffer* element) {
	CDS::DataBuffer* prev = CDS::Element::last(array);
	CDS::DataBuffer* last = CDS::Element::last(element);
	CDS::DataBuffer* next = prev->next;

	element->prev = prev;
	prev->next = element;
	
	last->next = next;
	if (NULL != next) next->prev = last;
	
	size_t size = CDS::Element::size(array);
	CDS::Element::resize(array, (size_t) (size + 1));
}

CDS::DataBuffer* CDS::Array::get(CDS::DataBuffer* array, size_t index) {
	CDS::DataBuffer* element = array->next;
	for (size_t i = (size_t) 0; i < index; i++) {
		CDS::DataBuffer* last = CDS::Element::last(element);
		element = last->next;
	}
	return element;
}

CDS::Iterator CDS::Array::taketo(CDS::Iterator iterator, size_t index) {
	uint8_t initial = iterator.read();
	// uint8_t ET = initial & CDS::TYPE_MASK; // TODO:: there is no check against CDS::ARRAY
	size_t hml = (size_t) (initial & ~CDS::TYPE_MASK);
	size_t size = (size_t) 0;
	for (size_t i = (size_t) 0; i < hml; i++) size = (size << 8) | ((size_t) iterator.read());
	
	for (size_t i = (size_t) 0; i < index; i++) {
		CDS::Element::last(&iterator);
	}
	
	return iterator;
}
