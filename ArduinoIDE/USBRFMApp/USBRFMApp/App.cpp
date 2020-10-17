#include "USBRFMApp.h"

void App_send(Node* cdNode, CDS::DataBuffer* params, CDS::DataBuffer* response) {
	USBRFMApp::App* app = (USBRFMApp::App*) cdNode;
	app->send(params, response);
}

USBRFMApp::App::App(Node* parent, const char* name) : Node(parent, name) {
	Method* send = new Node::Method(this, App_send);
	this->methods->set((char*) String(F("send")).c_str(), send);
}

USBRFMApp::App::~App() {

}

void USBRFMApp::App::setup() {

}

void USBRFMApp::App::loop() {

}

void USBRFMApp::App::state(CDS::DataBuffer* params, CDS::DataBuffer* response) {
	CDS::DataBuffer* object = this->rootIT(response);
	CDS::DataBuffer* state = CDS::Object::newObject(object, K("state"));
}

void USBRFMApp::App::onData(DataChannel* dataChannel, CDS::DataBuffer* data) {
	bool isNumber = CDS::Element::isNumber(data);
	if (isNumber) {
		CDS::DataBuffer* command = CDS::Element::newObject();
		CDS::DataBuffer* object = this->rootIT(command);
		CDS::DataBuffer* ondata = CDS::Object::newObject(object, K("ondata"));
		CDS::DataBuffer* rssi = CDS::Object::newNumber(ondata, K("rssi"));
		CDS::Number::set(rssi, LoRa.packetRssi()); // Received Signal Strength Indicator
		CDS::DataBuffer* snr = CDS::Object::newNumber(ondata, K("snr"));
		CDS::Number::set(snr, LoRa.packetSnr()); // Signal-to-noise ratio
		CDS::DataBuffer* pfe = CDS::Object::newNumber(ondata, K("pfe"));
		CDS::Number::set(pfe, LoRa.packetFrequencyError()); // Packet Frequency Error
		CDS::Object::set(ondata, K("data"), data);
		this->command(command);
		CDS::DataBuffer* last = CDS::Element::last(data);
		data->prev->next = last->next; // it is deleted later
		delete command;
	}
}

void USBRFMApp::App::send(CDS::DataBuffer* params, CDS::DataBuffer* response) {
	int sent = 0;
	CDS::DataBuffer* data = CDS::Object::get(params, K("data"));
	bool isNumber = CDS::Element::isNumber(data);
	if (isNumber) {
		for (int i = 0; i < this->channels->length; i++) {
			DataChannel* channel = this->channels->get(i);
			sent += channel->send(data);
			yield();
		}
		CDS::DataBuffer* object = this->rootIT(response);
		CDS::DataBuffer* sentObject = CDS::Object::newObject(object, K("sent"));
		CDS::DataBuffer* total = CDS::Object::newNumber(sentObject, K("total"));
		CDS::Number::set(total, sent);
		//CDS::DataBuffer* heap = CDS::Object::newNumber(sentObject, K("heap"));
		//CDS::Number::set(heap, ESP.getFreeHeap());
	}
}

