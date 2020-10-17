#include <CDS.h>

void CDS::Number::serialize(DataBuffer* element, Iterator* iterator) {
	bool isNumber = CDS::Element::isNumber(element);
	if (isNumber) {
		size_t hml = CDS::Element::hml(element);
		size_t size = CDS::Element::size(element);
		for (size_t i = (size_t) 0; i < size; i++) {
			uint8_t value = element->read((size_t) (1 + hml + i));
			iterator->write(value);
		}
	}
};

void CDS::Number::setChars(CDS::DataBuffer* number, const uint8_t* name) {
	size_t strsize = (size_t) strlen((const char*) name);
	CDS::Element::resize(number, strsize);
	size_t HML = CDS::Element::hml(number);
	for (size_t i = (size_t) 0; i < strsize; i++) {
		uint8_t value = (uint8_t) name[i];
		number->write((size_t) (1 + HML + i), value);
	}
}

bool CDS::Number::cmp(CDS::DataBuffer* number, const uint8_t* name) {
	size_t size = CDS::Element::size(number);
	size_t HML = CDS::Element::hml(number);
	size_t strsize = (size_t) strlen((const char*) name);
	bool equals = (size == strsize);
	if (equals) {
		for (size_t i = (size_t) 0; i < size && equals; i++) {
			uint8_t d = number->read((size_t) (1 + HML + i));
			uint8_t n = name[i];
			equals = equals && (d == n);
		}
	}
	return equals;
}

bool CDS::Number::cmp(CDS::DataBuffer* a, CDS::DataBuffer* b) {
	size_t asize = CDS::Element::size(a);
	size_t ahml = CDS::Element::hml(a);
	size_t bsize = CDS::Element::size(b);
	size_t bhml = CDS::Element::hml(b);
	bool equals = (asize == bsize);
	if (equals) {
		for (size_t i = (size_t) 0; i < asize && equals; i++) {
			uint8_t av = a->read((size_t) (1 + ahml + i));
			uint8_t bv = b->read((size_t) (1 + bhml + i));
			equals = equals && (av == bv);
		}
	}
	return equals;
}
