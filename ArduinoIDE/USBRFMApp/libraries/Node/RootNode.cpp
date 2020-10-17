#include <RootNode.h>


RootNode::RootNode(Node* parent, const char* name) : Node(parent, name) {
	
}

RootNode::~RootNode() {

}

void RootNode::setup() {
	
}

void RootNode::loop() {

}

void RootNode::onData(DataChannel* dataChannel, CDS::DataBuffer* command) {
	bool isObject = CDS::Element::isObject(command);
	if (isObject) {
		CDS::DataBuffer* response = CDS::Element::newObject();
		this->oncommand(command, response);
		this->send(response);
		delete response;
	}
}

void RootNode::command(CDS::DataBuffer* command) {
	this->send(command);
}
	
void RootNode::send(CDS::DataBuffer* command) {
	for (int i = 0; i < this->channels->length; i++) {
		DataChannel* channel = this->channels->get(i);
		channel->send(command);
		yield();
	}
}

CDS::DataBuffer* RootNode::rootIT(CDS::DataBuffer* root) {
	return root;
}

CDS::Iterator RootNode::storage() {
	return this->storageIterator;
}

