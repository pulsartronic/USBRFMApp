#include <DS.h>
#include <CDS.h>

#ifndef __DataChannel__
#define __DataChannel__

class DataChannel {
	public:
	
	class Handler {
		public:
		DS::List<DataChannel*>* channels = new DS::List<DataChannel*>();
		void addDataChannel(DataChannel* dataChannel);
		virtual void onData(DataChannel* dataChannel, CDS::DataBuffer* data) = 0;
	};
	
	DS::List<Handler*>* handlers = new DS::List<Handler*>();
	
	DataChannel();
	virtual ~DataChannel();
	
	virtual void loop();
	virtual int send(CDS::DataBuffer* data);
	void addHandler(DataChannel::Handler* handler);
};

#endif

