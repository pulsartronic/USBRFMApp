#include <CDS.h>

CDS::DataBuffer::DataBuffer() {

}

CDS::DataBuffer::~DataBuffer() {
	delete this->next;
}

void CDS::DataBuffer::resize(size_t size) {

}

void CDS::DataBuffer::write(size_t index, uint8_t value) {

}

uint8_t CDS::DataBuffer::read(size_t index) {
	return (uint8_t) 0;
}

void CDS::DataBuffer::write(size_t index, uint8_t* buffer, size_t size) {

}

CDS::DataBuffer* CDS::DataBuffer::subBuffer(size_t index, size_t size) {
	return NULL;
}

void CDS::DataBuffer::serialize(CDS::Iterator* iterator, size_t size) {

}


