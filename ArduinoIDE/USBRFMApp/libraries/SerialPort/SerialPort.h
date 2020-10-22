#include <Arduino.h>
#include <Node.h>
#include <DataChannel.h>
#include <SoftwareSerial.h>

#ifndef __SerialPort__
#define __SerialPort__

class SerialPort : public Node, public Stream {
	public:

	class Channel : public DataChannel {
		public:
		SerialPort* serial = NULL;
		DS::List<uint8_t>* bytes = NULL;
		uint32_t lread = 0l;
		uint16_t iread = 2000u;
		
		Channel(SerialPort* serial);
		~Channel();
		virtual void loop();
		virtual int send(CDS::DataBuffer* command);
	};

	SoftwareSerial* swserial = NULL;
	Stream* input = NULL;
	Stream* output = NULL;
	Channel channel;

	SerialPort(Node* parent, const char* name);
	virtual ~SerialPort();
	void setup();
	void loop();
	
	virtual void applySettings();
	virtual void state(CDS::DataBuffer* params, CDS::DataBuffer* response);
	virtual void save(CDS::DataBuffer* params, CDS::DataBuffer* response);
	virtual void from(CDS::DataBuffer* params);

	virtual int available() {return this->input->available();}
	virtual int read() {return this->input->read();}
	virtual size_t write(uint8_t b);
	virtual size_t write(const uint8_t* buffer, size_t size);
	virtual int peek() {return this->input->peek();}
	virtual void flush() {this->output->flush();}
	// TODO:: add more virtual methods
};

#endif
