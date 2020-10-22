#include <SerialPort.h>


SerialPort::SerialPort(Node* parent, const char* name) : channel(this), Node(parent, name) {

}

SerialPort::~SerialPort() {
	
}

void SerialPort::setup() {
	this->applySettings();
}

void SerialPort::loop() {
	this->channel.loop();
}

void SerialPort::save(CDS::DataBuffer* params, CDS::DataBuffer* response) {
	Node::save(params, response);
	delay(500); // give the other device the chance to reconfigure itself
}

void SerialPort::state(CDS::DataBuffer* params, CDS::DataBuffer* response) {
	CDS::DataBuffer* object = this->rootIT(response);
	CDS::DataBuffer* state = CDS::Object::newObject(object, K("state"));
	
	CDS::Iterator storage = this->storage();
	
	CDS::Iterator rxStorage = CDS::Object::taketo(storage, K("rx"));
	CDS::DataBuffer* savedRx = CDS::Element::nextElement(&rxStorage);
	uint8_t rx = CDS::Number::value<uint8_t>(savedRx);
	delete savedRx;
	
	CDS::Iterator txStorage = CDS::Object::taketo(storage, K("tx"));
	CDS::DataBuffer* savedTx = CDS::Element::nextElement(&txStorage);
	uint8_t tx = CDS::Number::value<uint8_t>(savedTx);
	delete savedTx;
	
	bool hardwareRX = 127 <= rx;
	bool hardwareTX = 127 <= tx;
	bool softwareRX = 0 <= rx && rx < 127;
	bool softwareTX = 0 <= tx && tx < 127;
	bool hardware = hardwareRX || hardwareTX;
	bool software = softwareRX || softwareTX;
	bool status = (hardware && !!Serial || (software && !!(*this->swserial)));
	CDS::DataBuffer* statusElement = CDS::Object::newNumber(state, K("status"));
	CDS::Number::set(statusElement, status);
	
	CDS::DataBuffer* config = CDS::Element::nextElement(&storage);
	CDS::Object::set(state, K("config"), config);
}

void SerialPort::from(CDS::DataBuffer* params) {
	CDS::Iterator storage = this->storage();
	CDS::Element::fill(storage, params);
}

size_t SerialPort::write(uint8_t b) {
	return this->output->write(b);
}

size_t SerialPort::write(const uint8_t* buffer, size_t size) {
	size_t written = this->output->write(buffer, size);
	this->flush();
	return written;
}

