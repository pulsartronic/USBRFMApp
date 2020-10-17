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
/*
	class Settings {
		public:
		long baudrate = 9600l;
		uint8_t config = 3;
		bool invert = false;
		uint16_t bsize = 128;
		int8_t rx = 127;
		int8_t tx = 127;
	};
	*/
	SoftwareSerial* swserial = NULL;
	Stream* input = NULL;
	Stream* output = NULL;
	Channel channel;
	//Settings settings;
	bool status = false;

	virtual ~SerialPort();
	SerialPort(Node* parent, const char* name);
	void setup();
	void loop();
	
	virtual void applySettings();
	virtual void state(CDS::DataBuffer* params, CDS::DataBuffer* response);
	virtual void save(CDS::DataBuffer* params, CDS::DataBuffer* response);
	virtual void from(CDS::DataBuffer* params);
	//virtual void to(CDS::DataBuffer* response);

	virtual int available() {return this->input->available();}
	virtual int read() {return this->input->read();}
	virtual size_t write(uint8_t b);
	virtual size_t write(const uint8_t* buffer, size_t size);
	virtual int peek() {return this->input->peek();}
	virtual void flush() {this->output->flush();}
	// TODO:: add more virtual methods
};

#endif
