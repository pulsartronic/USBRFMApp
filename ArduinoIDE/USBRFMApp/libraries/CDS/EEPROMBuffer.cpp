#include <CDS.h>

CDS::EEPROMBuffer::~EEPROMBuffer() {
	
}

CDS::EEPROMBuffer::EEPROMBuffer(size_t start) : start(start) {
	
}

void CDS::EEPROMBuffer::resize(size_t size) {
	
}

void CDS::EEPROMBuffer::write(size_t index, uint8_t value) {
	uint8_t storedValue = EEPROM.read(index);
	if (storedValue != value) {
		EEPROM.write(this->start + index, value);
	}
}

uint8_t CDS::EEPROMBuffer::read(size_t index) {
	uint8_t value = EEPROM.read(this->start + index);
	return value;
}


void CDS::EEPROMBuffer::write(size_t index, uint8_t* data, size_t size) {
	for (size_t i = (size_t) 0; i < size; i++) {
		uint8_t value = data[i];
		this->write(index + i, value);
	}
}

CDS::DataBuffer* CDS::EEPROMBuffer::subBuffer(size_t index, size_t size) {
	CDS::DataBuffer* subBuffer = new EEPROMBuffer(this->start + index);
	return subBuffer;
}

void CDS::EEPROMBuffer::serialize(CDS::Iterator* iterator, size_t size) {
	for (size_t i = (size_t) 0; i < size; i++) {
		uint8_t value = this->read(i);
		iterator->write(value);
	}
}

