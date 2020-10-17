#include <CDS.h>

CDS::PROGMEMBuffer::~PROGMEMBuffer() {
	
}

CDS::PROGMEMBuffer::PROGMEMBuffer(uint8_t* data, size_t start) : data(data), start(start) {
	
}

void CDS::PROGMEMBuffer::resize(size_t size) {

}

void CDS::PROGMEMBuffer::write(size_t index, uint8_t value) {

}

uint8_t CDS::PROGMEMBuffer::read(size_t index) {
	uint8_t value = pgm_read_byte(this->data + this->start + index);
	return value;
}


void CDS::PROGMEMBuffer::write(size_t index, uint8_t* data, size_t size) {

}

CDS::DataBuffer* CDS::PROGMEMBuffer::subBuffer(size_t index, size_t size) {
	CDS::DataBuffer* subBuffer = new PROGMEMBuffer(this->data, this->start + index);
	return subBuffer;
}

void CDS::PROGMEMBuffer::serialize(CDS::Iterator* iterator, size_t size) {

}
