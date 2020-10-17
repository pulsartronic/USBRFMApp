#include <DataChannel.h>

DataChannel::DataChannel() {

}

DataChannel::~DataChannel() {

}

void DataChannel::loop() {

}

void DataChannel::addHandler(DataChannel::Handler* handler) {
	this->handlers->add(handler);
}

int DataChannel::send(CDS::DataBuffer* data) {
	return 0;
}
