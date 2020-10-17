#include <DataChannel.h>

void DataChannel::Handler::addDataChannel(DataChannel* channel) {
	channel->addHandler(this);
	this->channels->add(channel);
}

