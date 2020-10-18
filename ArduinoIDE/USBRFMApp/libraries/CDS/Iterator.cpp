#include <CDS.h>

CDS::Iterator::Iterator() {
	
}

CDS::Iterator::Iterator(CDS::DataBuffer* buffer, size_t size) : buffer(buffer), size(size) {

}

size_t CDS::Iterator::available() {
	size_t available = (this->size >= this->index) ? (this->size - this->index) : (size_t) 0;
	return available;
}

void CDS::Iterator::write(uint8_t value) {
	this->buffer->write(this->index++, value);
}

void CDS::Iterator::write(uint8_t* data, size_t size) {
	this->buffer->write(this->index, data, size);
	this->index += size;
}

uint8_t CDS::Iterator::peek() {
	return this->buffer->read(this->index);
}

uint8_t CDS::Iterator::read() {
	return this->buffer->read(this->index++);
}

CDS::DataBuffer* CDS::Iterator::subBuffer(size_t size) {
	CDS::DataBuffer* subBuffer = this->buffer->subBuffer(this->index, size);
	this->index += size;
	return subBuffer;
}

void CDS::Iterator::skip(size_t count) {
	size_t available = this->available();
	this->index += min(count, available);
}


void CDS::Iterator::reset() {
	this->index = (size_t) 0;
}

size_t CDS::Iterator::readSize(uint8_t initial) {
	size_t hml = (size_t) (initial & ~CDS::TYPE_MASK);
	size_t size = (size_t) 0;
	for (size_t i = (size_t) 0; i < hml; i++) {
		size = (size << 8) | ((size_t) this->read());
	}
	return size;
}

