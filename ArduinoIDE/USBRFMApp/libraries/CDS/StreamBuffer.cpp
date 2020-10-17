#include <CDS.h>

CDS::StreamBuffer::~StreamBuffer() {
	
}

CDS::StreamBuffer::StreamBuffer(Stream* stream) : stream(stream) {
	
}

void CDS::StreamBuffer::write(size_t index, uint8_t value) {
	this->stream->write(value);
	this->stream->flush();
}

void CDS::StreamBuffer::write(size_t index, uint8_t* buffer, size_t size) {
	this->stream->write(buffer, (size_t) size);
	this->stream->flush();
}

uint8_t CDS::StreamBuffer::read(size_t index) {
	return this->stream->read();
}

