#include <SerialPort.h>


SerialPort::Channel::Channel(SerialPort* serial) : serial(serial) {
	
}

SerialPort::Channel::~Channel() {
	delete this->bytes;
}

void SerialPort::Channel::loop() {
	size_t available = this->serial->available();
	if (available) {
		this->lread = millis();
		
		if (NULL == this->bytes) this->bytes = new DS::List<uint8_t>();
		size_t length = (size_t) this->bytes->length;
		this->bytes->resize(length + available);
		this->serial->readBytes(this->bytes->buffer + length, available);
		yield();
		
		CDS::StaticBuffer* staticBuffer = new CDS::StaticBuffer(this->bytes->buffer);
		CDS::Iterator* iterator = new CDS::Iterator(staticBuffer, (size_t) this->bytes->length);
		bool valid = CDS::Element::valid(iterator);
		if (valid) {
			iterator->reset();
			CDS::DataBuffer* element = CDS::Element::nextElement(iterator);
			for (size_t i = (size_t) 0; i < this->handlers->length; i++) {
				DataChannel::Handler* handler = this->handlers->get(i);
				handler->onData(this, element);
			}
			delete element;
			delete this->bytes; this->bytes = NULL;
		}
		delete iterator;
		delete staticBuffer;
	} else {
		uint16_t elapsed = millis() - this->lread;
		if (elapsed >= this->iread) {
			if (NULL != this->bytes) {
				delete this->bytes; this->bytes = NULL;
			}
		}
	}
}

int SerialPort::Channel::send(CDS::DataBuffer* command) {
	int sent = 0;
	uint16_t size = CDS::Element::size(command);
	//if (0 < size) {
		this->serial->flush();
		CDS::StreamBuffer* streamBuffer = new CDS::StreamBuffer(this->serial);
		CDS::Iterator* iterator = new CDS::Iterator(streamBuffer, 0);
		CDS::Element::serialize(command, iterator);
		sent = iterator->index;
		delete iterator;
		delete streamBuffer;
		yield();
	//}
	return sent;
}
