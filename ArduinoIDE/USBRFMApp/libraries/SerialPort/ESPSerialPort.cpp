#ifdef ESP8266

#include <SerialPort.h>

SoftwareSerialConfig SerialPort_SWCONFIG(int index) {
	SoftwareSerialConfig swconfig = SWSERIAL_8N1;
	switch(index) {
		case 0:  { swconfig = SWSERIAL_5N1; } break;
		case 1:  { swconfig = SWSERIAL_6N1; } break;
		case 2:  { swconfig = SWSERIAL_7N1; } break;
		case 3:  { swconfig = SWSERIAL_8N1; } break; // (the default)
		case 4:  { swconfig = SWSERIAL_5N2; } break;
		case 5:  { swconfig = SWSERIAL_6N2; } break;
		case 6:  { swconfig = SWSERIAL_7N2; } break;
		case 7:  { swconfig = SWSERIAL_8N2; } break;
		case 8:  { swconfig = SWSERIAL_5E1; } break; // even parity
		case 9:  { swconfig = SWSERIAL_6E1; } break;
		case 10: { swconfig = SWSERIAL_7E1; } break;
		case 11: { swconfig = SWSERIAL_8E1; } break;
		case 12: { swconfig = SWSERIAL_5E2; } break;
		case 13: { swconfig = SWSERIAL_6E2; } break;
		case 14: { swconfig = SWSERIAL_7E2; } break;
		case 15: { swconfig = SWSERIAL_8E2; } break;
		case 16: { swconfig = SWSERIAL_5O1; } break; // odd parity
		case 17: { swconfig = SWSERIAL_6O1; } break;
		case 18: { swconfig = SWSERIAL_7O1; } break;
		case 19: { swconfig = SWSERIAL_8O1; } break;
		case 20: { swconfig = SWSERIAL_5O2; } break;
		case 21: { swconfig = SWSERIAL_6O2; } break;
		case 22: { swconfig = SWSERIAL_7O2; } break;
		case 23: { swconfig = SWSERIAL_8O2; } break;
	}
	return swconfig;
}

SerialConfig SerialPort_CONFIG(int index) {
	SerialConfig config = SERIAL_8N1;
	switch(index) {
		case 0:  { config = SERIAL_5N1; } break;
		case 1:  { config = SERIAL_6N1; } break;
		case 2:  { config = SERIAL_7N1; } break;
		case 3:  { config = SERIAL_8N1; } break; // (the default)
		case 4:  { config = SERIAL_5N2; } break;
		case 5:  { config = SERIAL_6N2; } break;
		case 6:  { config = SERIAL_7N2; } break;
		case 7:  { config = SERIAL_8N2; } break;
		case 8:  { config = SERIAL_5E1; } break; // even parity
		case 9:  { config = SERIAL_6E1; } break;
		case 10: { config = SERIAL_7E1; } break;
		case 11: { config = SERIAL_8E1; } break;
		case 12: { config = SERIAL_5E2; } break;
		case 13: { config = SERIAL_6E2; } break;
		case 14: { config = SERIAL_7E2; } break;
		case 15: { config = SERIAL_8E2; } break;
		case 16: { config = SERIAL_5O1; } break; // odd parity
		case 17: { config = SERIAL_6O1; } break;
		case 18: { config = SERIAL_7O1; } break;
		case 19: { config = SERIAL_8O1; } break;
		case 20: { config = SERIAL_5O2; } break;
		case 21: { config = SERIAL_6O2; } break;
		case 22: { config = SERIAL_7O2; } break;
		case 23: { config = SERIAL_8O2; } break;
	}
	return config;
}

SerialMode SerialPort_MODE(int tx, int rx) {
	SerialMode mode = SERIAL_FULL;
	if (0 <= tx && 0 <= rx) {
		mode = SERIAL_FULL;
	} else {
		mode = (0 <= tx) ? SERIAL_TX_ONLY : SERIAL_RX_ONLY;
	}
	return mode;
}


void SerialPort::applySettings() {
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

	CDS::Iterator baudrateStorage = CDS::Object::taketo(storage, K("baudrate"));
	CDS::DataBuffer* savedBaudrate = CDS::Element::nextElement(&baudrateStorage);
	uint32_t baudrate = CDS::Number::value<uint32_t>(savedBaudrate);
	delete savedBaudrate;
	
	CDS::Iterator configStorage = CDS::Object::taketo(storage, K("config"));
	CDS::DataBuffer* savedConfig = CDS::Element::nextElement(&configStorage);
	uint8_t config = CDS::Number::value<uint8_t>(savedConfig);
	delete savedConfig;
	
	CDS::Iterator invertStorage = CDS::Object::taketo(storage, K("invert"));
	CDS::DataBuffer* savedInvert = CDS::Element::nextElement(&invertStorage);
	uint8_t invert = CDS::Number::value<uint8_t>(savedInvert);
	delete savedInvert;
	
	CDS::Iterator bsizeStorage = CDS::Object::taketo(storage, K("bsize"));
	CDS::DataBuffer* savedBsize = CDS::Element::nextElement(&bsizeStorage);
	uint8_t bsize = CDS::Number::value<uint8_t>(savedBsize);
	delete savedBsize;
	
	if (software) {
		delete this->swserial;
		this->swserial = new SoftwareSerial();
		this->swserial->begin(
			baudrate,
			SerialPort_SWCONFIG(config),
			softwareRX ? rx : -1,
			softwareTX ? tx : -1,
			invert,
			bsize);
	}

	if (hardware) {
		SerialConfig config = SerialPort_CONFIG(config);
		SerialMode mode = SerialPort_MODE(rx, tx);
		Serial.begin(baudrate, config, mode, 1, invert);
		Serial.setRxBufferSize(bsize);
	}

	if (hardwareRX) {
		this->input = &Serial;
	} else if (softwareRX) {
		this->input = this->swserial;
	}

	if (hardwareTX) {
		this->output = &Serial;
	} else if (softwareTX) {
		this->output = this->swserial;
	}
}

#endif

