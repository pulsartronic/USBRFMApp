#include <DataChannel.h>
#include <Node.h>
#include <SPI.h>
#include <LoRa.h>

#ifndef __RFM__
#define __RFM__

class RFM : public Node {
	public:

	class Channel : public DataChannel {
		public:
		RFM* rfm = NULL;
		Channel(RFM* rfm);
		virtual void loop();
		virtual int send(CDS::DataBuffer* command);
	};
/*
	class Pins {
		public:
		uint8_t miso = 12;
		uint8_t mosi = 13;
		uint8_t sck = 14;
		uint8_t nss = 8;
		uint8_t rst = 7;
		int8_t dio[6] = {5, -1, -1, -1, -1, -1};
	};
/*
	class Settings {
		public:

		class Frequency {
			public:
			long curr = 868300000l; // current frequency in Hz
			long min  = 858000000l; // min frequency in Hz
			long max  = 878000000l; // max frequency in Hz
		};

		Frequency freq;
		uint8_t txpw    = (uint8_t) 17; // tx power
		uint8_t sfac    = (uint8_t) 7;  // spreading factor
		long sbw        = 125E3;        // SignalBandwidth
		uint8_t crat    = (uint8_t) 5;  // coding rate
		uint8_t plength = (uint8_t) 8;  // preamble length
		uint8_t sw      = 0x39;         // syncword default:0x39
		bool cad        = false;
		bool crc        = true;
		bool iiq        = false;        // InvertIQ
	};

	RFM::Settings settings;
	RFM::Pins pins;
	*/
	RFM::Channel channel;
	bool active = false;

	virtual ~RFM();
	RFM(Node* parent, const char* name);
	void setup();
	void loop();
	//void apply(RFM::Settings* settings);
	//int send(Data::Packet* packet);
	//void read(RFM::Handler* handler);

	virtual void applySettings();
	virtual void state(CDS::DataBuffer* params, CDS::DataBuffer* response);
	virtual void from(CDS::DataBuffer* params);
};

#endif
