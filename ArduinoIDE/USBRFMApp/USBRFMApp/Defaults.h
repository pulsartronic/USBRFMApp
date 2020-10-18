#include <CDS.h>

const uint8_t DEFAULTS[] PROGMEM = {
	CDS::OBJECT | 1, 0x03,
		CDS::BINARY | 1, 0x06, 's','e','r','i','a','l', // see libraries/SerialPort/SerialPort.cpp
		CDS::OBJECT | 1, 0x06, // 6 key/values
			CDS::BINARY | 1, 0x08, 'b','a','u','d','r','a','t','e',
			CDS::BINARY | 1, 0x04, 0x00, 0x00, 0x25, 0x80, // 0x00002580 = 9600
			CDS::BINARY | 1, 0x06, 'c','o','n','f','i','g',
			CDS::BINARY | 1, 0x01, 0x03, // SERIAL_8N1
			CDS::BINARY | 1, 0x06, 'i','n','v','e','r','t',
			CDS::BINARY | 1, 0x01, 0x00, // false
			CDS::BINARY | 1, 0x05, 'b','s','i','z','e',
			CDS::BINARY | 1, 0x01, 0x80, // 128
			CDS::BINARY | 1, 0x02, 'r','x',
			CDS::BINARY | 1, 0x01, 0x7F, // 127
			CDS::BINARY | 1, 0x02, 't','x',
			CDS::BINARY | 1, 0x01, 0x7F, // 127
		CDS::BINARY | 1, 0x03, 'r','f','m', // see libraries/RFM/RFM.cpp
		CDS::OBJECT | 1, 0x0A, // 10 key/values
			CDS::BINARY | 1, 0x04, 'f','r','e','q',
			CDS::OBJECT | 1, 0x03, // 3 key/values
				CDS::BINARY | 1, 0x04, 'c','u','r','r',
				CDS::BINARY | 1, 0x04, 0x33, 0xC1, 0x34, 0xE0, // 0x33C134E0 = 868300000
				CDS::BINARY | 1, 0x03, 'm','i','n',
				CDS::BINARY | 1, 0x04, 0x33, 0x24, 0x0A, 0x80, // 858000000
				CDS::BINARY | 1, 0x03, 'm','a','x',
				CDS::BINARY | 1, 0x04, 0x34, 0x55, 0x37, 0x80, // 878000000
			CDS::BINARY | 1, 0x04, 't','x','p','w', // tx power
			CDS::BINARY | 1, 0x01, 0x11, // = 17
			CDS::BINARY | 1, 0x04, 's','f','a','c', // spreading factor
			CDS::BINARY | 1, 0x01, 0x07, // = 7
			CDS::BINARY | 1, 0x03, 's','b','w', // signal bandwidth
			CDS::BINARY | 1, 0x04, 0x00, 0x01, 0xE8, 0x48, // = 125000
			CDS::BINARY | 1, 0x04, 'c','r','a','t', // codingrate4
			CDS::BINARY | 1, 0x01, 0x05, // = 5
			CDS::BINARY | 1, 0x07, 'p','l','e','n','g','t','h', // preamble length
			CDS::BINARY | 1, 0x01, 0x08, // = 8
			CDS::BINARY | 1, 0x02, 's','w', // sync word
			CDS::BINARY | 1, 0x01, 0x39, // = 0x39
			CDS::BINARY | 1, 0x03, 'c','r','c',
			CDS::BINARY | 1, 0x01, 0x01, // true
			CDS::BINARY | 1, 0x03, 'i','i','q',
			CDS::BINARY | 1, 0x01, 0x00, // false
			CDS::BINARY | 1, 0x04, 'p','i','n','s', // RFM PINS
			CDS::OBJECT | 1, 0x06, // 6 key/values
				CDS::BINARY | 1, 0x04, 'm','i','s','o',
				CDS::BINARY | 1, 0x01, 0x0E,
				CDS::BINARY | 1, 0x04, 'm','o','s','i',
				CDS::BINARY | 1, 0x01, 0x10,
				CDS::BINARY | 1, 0x03, 's','c','k',
				CDS::BINARY | 1, 0x01, 0x0F,
				CDS::BINARY | 1, 0x03, 'n','s','s',
				CDS::BINARY | 1, 0x01, 0x10, // 0x05, // 0x10, // 
				CDS::BINARY | 1, 0x03, 'r','s','t',
				CDS::BINARY | 1, 0x01, 0x0F, // 0x07, // 0x0F, // 
				CDS::BINARY | 1, 0x03, 'd','i','o',
				CDS::ARRAY | 1, 0x06, // 6 elements
					CDS::BINARY | 1, 0x01, 0x04, // 0x08, // 0x04, // 
					CDS::BINARY | 1, 0x01, 0xFF,
					CDS::BINARY | 1, 0x01, 0xFF,
					CDS::BINARY | 1, 0x01, 0xFF,
					CDS::BINARY | 1, 0x01, 0xFF,
					CDS::BINARY | 1, 0x01, 0xFF,
		CDS::BINARY | 1, 0x03, 'a','p','p',
		CDS::OBJECT | 1, 0x00
};
