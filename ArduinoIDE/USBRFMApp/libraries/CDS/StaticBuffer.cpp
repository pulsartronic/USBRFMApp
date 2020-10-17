#include <CDS.h>

CDS::StaticBuffer::~StaticBuffer() {

}

CDS::StaticBuffer::StaticBuffer(uint8_t* data) : data(data) {

}

void CDS::StaticBuffer::resize(size_t size) {

}

void CDS::StaticBuffer::write(size_t index, uint8_t value) {
	this->data[index] = value;
}

uint8_t CDS::StaticBuffer::read(size_t index) {
	return this->data[index];
}

void CDS::StaticBuffer::write(size_t index, uint8_t* data, size_t size) {
	// memcpy ??
	for (size_t i = (size_t) 0; i < size; i++) {
		this->data[index, i] = data[i];
	}
}

CDS::DataBuffer* CDS::StaticBuffer::subBuffer(size_t index, size_t size) {
	uint8_t* subbuffer = this->data + index;
	CDS::DataBuffer* subBuffer = new CDS::StaticBuffer(subbuffer);
	return subBuffer;
}

void CDS::StaticBuffer::serialize(CDS::Iterator* iterator, size_t size) {
	iterator->write(this->data, size);
}
