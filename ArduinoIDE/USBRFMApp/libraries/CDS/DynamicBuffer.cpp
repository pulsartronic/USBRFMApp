#include <CDS.h>

CDS::DynamicBuffer::~DynamicBuffer() {
	delete[] this->data;
}

CDS::DynamicBuffer::DynamicBuffer(size_t size) {
	this->data = new uint8_t[size];
}

void CDS::DynamicBuffer::resize(size_t size) {
	delete[] this->data;
	this->data = new uint8_t[size];
}

void CDS::DynamicBuffer::write(size_t index, uint8_t value) {
	this->data[index] = value;
}

uint8_t CDS::DynamicBuffer::read(size_t index) {
	return this->data[index];
}


void CDS::DynamicBuffer::write(size_t index, uint8_t* data, size_t size) {
	// memcpy ??
	for (size_t i = (size_t) 0; i < size; i++) {
		this->data[index + i] = data[i];
	}
}

CDS::DataBuffer* CDS::DynamicBuffer::subBuffer(size_t index, size_t size) {
	uint8_t* subbuffer = this->data + index;
	CDS::DataBuffer* subBuffer = new CDS::StaticBuffer(subbuffer);
	return subBuffer;
}

void CDS::DynamicBuffer::serialize(CDS::Iterator* iterator, size_t size) {
	iterator->write(this->data, size);
}
