#include <Arduino.h>
#include <DS.h>
#include <EEPROM.h>

#ifndef __CDS__
#define __CDS__

#define S(s) String(F(s)).c_str()
#define K(s) ((const uint8_t*)String(F(s)).c_str())

namespace CDS {
	class DataBuffer;

	const uint8_t TYPE_MASK   = (uint8_t) 192;
	const uint8_t OBJECT      = (uint8_t) 64;
	const uint8_t ARRAY       = (uint8_t) 128;
	const uint8_t BINARY      = (uint8_t) 192;
	
	class Iterator {
		public:
		DataBuffer* buffer = NULL;
		size_t index = (size_t) 0;
		size_t size  = (size_t) 0;
		
		Iterator();
		Iterator(DataBuffer* buffer, size_t size);
		virtual void write(uint8_t value);
		virtual void write(uint8_t* data, size_t size);
		virtual uint8_t read();
		virtual uint8_t peek();
		virtual size_t available();
		virtual DataBuffer* subBuffer(size_t size);
		virtual void reset();
		virtual size_t readSize(uint8_t initial);
	};

	class DataBuffer {
		public:
		DataBuffer* prev = NULL;
		DataBuffer* next = NULL;
		DataBuffer();
		virtual ~DataBuffer();
		
		virtual void resize(size_t size);
		virtual void write(size_t index, uint8_t value);
		virtual void write(size_t index, uint8_t* buffer, size_t size);
		virtual uint8_t read(size_t index);
		virtual DataBuffer* subBuffer(size_t index, size_t size);
		virtual void serialize(CDS::Iterator* iterator, size_t size);
	};
	
	class DynamicBuffer : public DataBuffer {
		public:
		uint8_t* data = NULL;
		DynamicBuffer(size_t size);
		virtual ~DynamicBuffer();
		virtual void resize(size_t size);
		virtual void write(size_t index, uint8_t value);
		virtual void write(size_t index, uint8_t* buffer, size_t size);
		virtual uint8_t read(size_t index);
		virtual DataBuffer* subBuffer(size_t index, size_t size);
		virtual void serialize(CDS::Iterator* iterator, size_t size);
	};
	
	class StaticBuffer : public DataBuffer {
		public:
		uint8_t* data = NULL;
		StaticBuffer(uint8_t* data);
		virtual ~StaticBuffer();
		virtual void resize(size_t size);
		virtual void write(size_t index, uint8_t value);
		virtual void write(size_t index, uint8_t* buffer, size_t size);
		virtual uint8_t read(size_t index);
		virtual DataBuffer* subBuffer(size_t index, size_t size);
		virtual void serialize(CDS::Iterator* iterator, size_t size);
	};
	
	class StreamBuffer : public DataBuffer {
		public:
		Stream* stream = NULL;
		StreamBuffer(Stream* stream);
		virtual ~StreamBuffer();
		virtual void write(size_t index, uint8_t value);
		virtual void write(size_t index, uint8_t* buffer, size_t size);
		virtual uint8_t read(size_t index);
	};
	
	class PROGMEMBuffer : public DataBuffer {
		public:
		uint8_t* data = NULL;
		size_t start = (size_t) 0;
		PROGMEMBuffer(uint8_t* data, size_t start);
		virtual ~PROGMEMBuffer();
		virtual void resize(size_t size);
		virtual void write(size_t index, uint8_t value);
		virtual void write(size_t index, uint8_t* buffer, size_t size);
		virtual uint8_t read(size_t index);
		virtual DataBuffer* subBuffer(size_t index, size_t size);
		virtual void serialize(CDS::Iterator* iterator, size_t size);
	};
	
	class EEPROMBuffer : public DataBuffer {
		public:
		size_t start = (size_t) 0;
		EEPROMBuffer(size_t start);
		virtual ~EEPROMBuffer();
		virtual void resize(size_t size);
		virtual void write(size_t index, uint8_t value);
		virtual void write(size_t index, uint8_t* buffer, size_t size);
		virtual uint8_t read(size_t index);
		virtual DataBuffer* subBuffer(size_t index, size_t size);
		virtual void serialize(CDS::Iterator* iterator, size_t size);
	};
	
	class Element {
		public:
		static const uint8_t TYPE_MASK   = (uint8_t) 192;
		static const uint8_t ARRAY  = (uint8_t) 128;
		static const uint8_t OBJECT = (uint8_t) 64;
		static const uint8_t BINARY = (uint8_t) 192;
		
		static DataBuffer* newObject();
		static DataBuffer* newArray();
		static DataBuffer* newNumber();
		static DataBuffer* newNumber(const uint8_t* name);
		
		static bool valid(Iterator* iterator);
		static bool check(Iterator* iterator);
		static DataBuffer* nextElement(Iterator* iterator);
		
		static size_t hml(CDS::DataBuffer* element);
		static size_t size(CDS::DataBuffer* element);
		static void resize(DataBuffer* element, size_t size);
		static DataBuffer* last(DataBuffer* element);
		static void last(Iterator* iterator);
		static DataBuffer* replace(DataBuffer* element, DataBuffer* newElement);
		
		static bool isObject(DataBuffer* element);
		static bool isArray(DataBuffer* element);
		static bool isNumber(DataBuffer* element);
		static size_t calculateLength(DataBuffer* element);
		static void serialize(DataBuffer* element, CDS::Iterator* iterator);
		static void merge(CDS::Iterator storage, CDS::DataBuffer* element);
		//static String stringify(DataBuffer* element);
	};
	
	class Object {
		public:
		
		static DataBuffer* newObject(DataBuffer* object, const uint8_t* name);
		static DataBuffer* newArray(DataBuffer* object, const uint8_t* name);
		static DataBuffer* newNumber(DataBuffer* object, const uint8_t* name);
		
		static DataBuffer* get(DataBuffer* object, const uint8_t* name);
		static CDS::DataBuffer* key(DataBuffer* object, size_t index);
		static void set(DataBuffer* object, const uint8_t* name, CDS::DataBuffer* value);
		
		static Iterator taketo(Iterator iterator, const uint8_t* name);
		static Iterator taketo(Iterator storage, DataBuffer* key);
	};
	
	class Array {
		public:
		
		static DataBuffer* newObject(DataBuffer* array);
		static DataBuffer* newArray(DataBuffer* array);
		static DataBuffer* newNumber(DataBuffer* array);
		static DataBuffer* add(DataBuffer* array, DataBuffer* element);
		static DataBuffer* get(DataBuffer* object, size_t index);
		static Iterator taketo(CDS::Iterator iterator, size_t index);
	};
	
	class Number {
		public:
		static void setChars(DataBuffer* object, const uint8_t* name);
		static bool cmp(DataBuffer* number, const uint8_t* name);
		static bool cmp(DataBuffer* a, DataBuffer* b);
		static void serialize(DataBuffer* element, CDS::Iterator* iterator);
		
		template<typename T> static T value(DataBuffer* number) {
			T ret = (T) 0;
			size_t typesize = sizeof(T);
			size_t HML = CDS::Element::hml(number);
			size_t size = CDS::Element::size(number);
			size_t total = min(typesize, size);
			size_t s = (size_t) (HML + size);
			for (size_t i = (size_t) 0; i < total; i++) {
				T v = (T) number->read(s - i);
				ret = ret | (v << 8u * i);
			}
			return ret;
		}

		template<typename T> static void set(DataBuffer* number, T value) {
			size_t size = (size_t) sizeof(T);
			CDS::Element::resize(number, size);
			size_t HML = CDS::Element::hml(number);
			for (size_t i = 0u; i < size; i++) {
				T dvalue = value >> (8u * (size - i - 1));
				number->write((size_t) (1 + HML + i), (uint8_t) (dvalue & (T) 255));
			}
		}
		
		static void set(DataBuffer* number, float value) {
			size_t size = (size_t) sizeof(float); // WARNING, take care of endianess
			CDS::Element::resize(number, size);
			size_t hml = CDS::Element::hml(number);
			for (size_t i = (size_t) 0; i < size; i++) {
				uint8_t b = ((uint8_t*)(&value))[size - i - 1];
				number->write((size_t) (1 + hml + i), b);
			}
		}
	};
}


#endif

