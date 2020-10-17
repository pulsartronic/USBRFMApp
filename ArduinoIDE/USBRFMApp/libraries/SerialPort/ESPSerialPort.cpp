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
	bool hardwareRX = 127 <= this->settings.rx;
	bool hardwareTX = 127 <= this->settings.tx;
	bool softwareRX = 0 <= this->settings.rx && this->settings.rx < 127;
	bool softwareTX = 0 <= this->settings.tx && this->settings.tx < 127;
	bool hardware = hardwareRX || hardwareTX;
	bool software = softwareRX || softwareTX;

	if (software) {
		delete this->swserial;
		this->swserial = new SoftwareSerial();
		this->swserial->begin(
			this->settings.baudrate,
			SerialPort_SWCONFIG(this->settings.config),
			softwareRX ? this->settings.rx : -1,
			softwareTX ? this->settings.tx : -1,
			this->settings.invert,
			this->settings.bsize);
	}

	if (hardware) {
		SerialConfig config = SerialPort_CONFIG(this->settings.config);
		SerialMode mode = SerialPort_MODE(this->settings.rx, this->settings.tx);
		Serial.begin(this->settings.baudrate, config, mode, 1, this->settings.invert);
		Serial.setRxBufferSize(this->settings.bsize);
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

