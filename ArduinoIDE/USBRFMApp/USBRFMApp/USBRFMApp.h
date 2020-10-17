#include <SerialPort.h>
#include <RFM.h>
#include <RootNode.h>
#include "Defaults.h"

#ifndef __USBRFMApp__
#define __USBRFMApp__

class USBRFMApp : public RootNode {
	public:

	class App : public Node, public DataChannel::Handler {
		public:
		App(Node* parent, const char* name);
		virtual ~App();
		virtual void onData(DataChannel* dataChannel, CDS::DataBuffer* data);
		virtual void setup();
		virtual void loop();
		virtual void state(CDS::DataBuffer* params, CDS::DataBuffer* response);
		virtual void send(CDS::DataBuffer* params, CDS::DataBuffer* response);
	};

	SerialPort serial;
	RFM rfm;
	App app;
	
	USBRFMApp();
	virtual ~USBRFMApp();
	void loop();
	void setup();
};

#endif
