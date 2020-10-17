#include <RFM.h>

RFM::Channel::Channel(RFM* rfm) : rfm(rfm) {
	
}

void RFM::Channel::loop() {
	int size = LoRa.parsePacket();
	if (size) {
		CDS::DynamicBuffer* element = new CDS::DynamicBuffer((size_t) (2 + size));
		element->write((size_t) 0, (uint8_t) (CDS::BINARY | (uint8_t) 1));
		element->write((size_t) 1, (uint8_t) size);
		
		int available = LoRa.available();
		uint16_t i = 0;
		while (available && (i < size)) {
			element->data[2 + i++] = LoRa.read();
			available = LoRa.available();
		}
		
		for (uint16_t i = 0u; i < this->handlers->length; i++) {
			DataChannel::Handler* handler = this->handlers->get(i);
			handler->onData(this, element);
		}
		delete element;
	}
}

int RFM::Channel::send(CDS::DataBuffer* command) {
	int sent = 0;
	if (this->rfm->active) {
		// TODO:: make more checks against transmission
		sent = LoRa.beginPacket();
		if (sent) {
			CDS::StreamBuffer* streamBuffer = new CDS::StreamBuffer(&LoRa);
			CDS::Iterator* iterator = new CDS::Iterator(streamBuffer, 0);
			CDS::Number::serialize(command, iterator);
			sent = iterator->index;
			delete streamBuffer;
			delete iterator;
			// TODO:: should we use async ending ?? !!!potential dead-lock!!!
			// if the RFM is not working properly, here it locks
			int end = LoRa.endPacket();
			if (0 == end) {
				sent = 0;
			}
		}
	}
	return sent;
}

